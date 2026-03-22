"""
Upload router - handles video file uploads and processing
"""
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import os
import json
import uuid
import traceback

from database import get_db
from models import Interview
from utils.file_validation import FileValidator

# Try to import video/audio processing — gracefully disabled if deps not installed
try:
    from services.video_processing import process_video_facial
    VIDEO_PROCESSING_AVAILABLE = True
except ImportError:
    VIDEO_PROCESSING_AVAILABLE = False
    print("⚠ video_processing not available")

try:
    from services.audio_processing import process_audio
    AUDIO_PROCESSING_AVAILABLE = True
except ImportError:
    AUDIO_PROCESSING_AVAILABLE = False
    print("⚠ audio_processing not available")

try:
    from services.scoring_engine import compute_confidence_score, generate_feedback
    SCORING_AVAILABLE = True
except ImportError:
    SCORING_AVAILABLE = False
    print("⚠ scoring_engine not available")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()


@router.post("/upload", response_model=dict)
async def upload_video(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and process an interview video. Returns analysis results."""

    if not VIDEO_PROCESSING_AVAILABLE or not AUDIO_PROCESSING_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail=(
                "Video analysis dependencies not installed. "
                "Uncomment opencv-python, mediapipe, openai-whisper, librosa "
                "in requirements.txt and reinstall."
            )
        )

    # --- Read entire file into memory first (avoids seek/position issues) ---
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {e}")

    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # --- Validate extension ---
    filename = file.filename or "upload.mp4"
    ext = os.path.splitext(filename)[1].lower()
    allowed_exts = {".mp4", ".mov", ".avi", ".webm", ".mkv"}
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(allowed_exts)}"
        )

    # --- Validate size (100 MB) ---
    max_size = 100 * 1024 * 1024
    if len(contents) > max_size:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({len(contents) / 1024 / 1024:.1f} MB). Max 100 MB."
        )

    # --- Save to disk ---
    unique_name = f"{uuid.uuid4()}{ext}"
    video_path = os.path.join(UPLOAD_DIR, unique_name)
    try:
        with open(video_path, "wb") as f:
            f.write(contents)
        del contents  # free memory
        print(f"✓ Video saved: {video_path} ({os.path.getsize(video_path)} bytes)")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    # --- Process ---
    try:
        print("→ Running facial analysis...")
        facial_metrics = process_video_facial(video_path)
        print(f"  facial_metrics: {facial_metrics}")

        print("→ Running audio analysis...")
        speech_metrics = process_audio(video_path)
        print(f"  speech_metrics: {speech_metrics}")

        print("→ Computing score...")
        confidence_score = compute_confidence_score(facial_metrics, speech_metrics)
        strengths, improvements = generate_feedback(facial_metrics, speech_metrics)
        print(f"  score: {confidence_score}")

        # --- Save to DB ---
        interview = Interview(
            eye_contact_score=facial_metrics["eye_contact_score"],
            head_stability_score=facial_metrics["head_stability_score"],
            smile_score=facial_metrics["smile_score"],
            face_presence_percentage=facial_metrics["face_presence_percentage"],
            speech_rate=speech_metrics["speech_rate"],
            filler_percentage=speech_metrics["filler_percentage"],
            pitch_mean=speech_metrics["pitch_mean"],
            pitch_variance=speech_metrics["pitch_variance"],
            energy_stability=speech_metrics["energy_stability"],
            confidence_score=confidence_score,
            strengths=json.dumps(strengths),
            improvements=json.dumps(improvements),
            video_duration=speech_metrics.get("duration", 0),
            transcript=speech_metrics.get("transcript", "")
        )
        db.add(interview)
        db.commit()
        db.refresh(interview)
        print(f"✓ Interview saved with ID: {interview.id}")

        return {
            "id": interview.id,
            "confidence_score": confidence_score,
            "strengths": strengths,
            "improvements": improvements,
            "facial_metrics": facial_metrics,
            "speech_metrics": speech_metrics
        }

    except HTTPException:
        raise
    except Exception as e:
        # Print full traceback to backend console so we can see exactly what failed
        print("❌ Upload processing error:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

    finally:
        # Always clean up the saved video
        try:
            if os.path.exists(video_path):
                os.remove(video_path)
        except Exception:
            pass

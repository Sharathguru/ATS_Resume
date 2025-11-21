import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  dismissError,
  resetScanView,
  selectError,
  selectStatus,
  submitScan,
} from "../features/scan/scanSlice";

const MAX_JD_CHARS = 4000;

const UploadForm = () => {
  const dispatch = useDispatch();
  const status = useSelector(selectStatus);
  const apiError = useSelector(selectError);

  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [localError, setLocalError] = useState(null);
  const fileInputRef = useRef(null);

  const isLoading = status === "loading";
  const remainingChars = MAX_JD_CHARS - jobDescription.length;

  useEffect(() => {
    if (apiError) {
      setLocalError(apiError);
    }
  }, [apiError]);

  const validateForm = () => {
    if (!resumeFile) {
      setLocalError("Upload a PDF, DOCX, or TXT resume to continue.");
      return false;
    }
    if (!jobDescription.trim()) {
      setLocalError("Paste the target job description so we can match keywords.");
      return false;
    }
    setLocalError(null);
    return true;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    dispatch(dismissError());
    dispatch(submitScan({ file: resumeFile, jobDescription: jobDescription.trim() }));
  };

  const handleFilePick = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    setLocalError(null);
  };

  const handleClear = () => {
    setJobDescription("");
    setResumeFile(null);
    setLocalError(null);
    dispatch(dismissError());
    dispatch(resetScanView());
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <div>
          <p className="eyebrow">Scan setup</p>
          <h2>Upload resume & match with a job</h2>
        </div>
        <button type="button" className="ghost-button" onClick={handleClear} disabled={isLoading}>
          Reset
        </button>
      </div>

      <label className="form-label" htmlFor="resume-file">
        Resume document
      </label>
      <div className="file-input">
        <input
          id="resume-file"
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFilePick}
          disabled={isLoading}
        />
        <p className="file-hint">
          {resumeFile ? resumeFile.name : "Drag & drop or click to browse (PDF / DOCX / TXT)"}
        </p>
      </div>

      <label className="form-label" htmlFor="job-description">
        Job description
      </label>
      <textarea
        id="job-description"
        value={jobDescription}
        onChange={(event) => setJobDescription(event.target.value.slice(0, MAX_JD_CHARS))}
        placeholder="Paste the exact job description to align keywords, responsibilities, and skills."
        rows={8}
        disabled={isLoading}
      />
      <div className="form-meta">
        <span>{Math.max(0, remainingChars)} characters left</span>
        <span>We never store your JD — used only for this scan.</span>
      </div>

      {localError ? <p className="form-error">{localError}</p> : null}

      <button type="submit" className="primary-button" disabled={isLoading}>
        {isLoading ? "Scanning with AI..." : "Run ATS Scan"}
      </button>
    </form>
  );
};

export default UploadForm;


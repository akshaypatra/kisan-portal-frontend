import { useEffect, useState } from "react";
import { MdLanguage } from "react-icons/md";

const LANGUAGES = [
  { code: "", label: "English (Default)" },

  // Major Indian Languages
  { code: "hi", label: "Hindi" },
  { code: "mr", label: "Marathi" },
  { code: "gu", label: "Gujarati" },
  { code: "kn", label: "Kannada" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "bn", label: "Bengali" },
  { code: "pa", label: "Punjabi" },
  { code: "ml", label: "Malayalam" },
  { code: "ur", label: "Urdu" },
  { code: "as", label: "Assamese" },
  { code: "or", label: "Odia" },
  { code: "ne", label: "Nepali" },
  { code: "sa", label: "Sanskrit" },
  { code: "kok", label: "Konkani" }, // Note: Google treats Konkani under Marathi sometimes
  { code: "mai", label: "Maithili" }, // Google supports it
  { code: "mni-Mtei", label: "Manipuri (Meitei)" },

];

const TranslateButton = () => {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Wait until Google injects the hidden <select class="goog-te-combo">
  useEffect(() => {
    const check = () => {
      const combo = document.querySelector("select.goog-te-combo");
      if (combo) {
        setReady(true);
        clearInterval(id);
      }
    };

    const id = setInterval(check, 500);
    return () => clearInterval(id);
  }, []);

  const translatePage = (langCode) => {
    const combo = document.querySelector("select.goog-te-combo");
    if (!combo) return;

    combo.value = langCode; // e.g. "hi", "mr", "ta"
    combo.dispatchEvent(new Event("change"));

    setOpen(false);
  };

  return (
    <div className="translate-button-container" >
      <button
        className="btn btn-light d-flex align-items-center gap-2"
        onClick={() => ready && setOpen((prev) => !prev)}
        disabled={!ready}
      >
        <MdLanguage size={22} />
        {ready ? "Translate" : "Loading..."}
      </button>

      {open && (
        <ul
          className="dropdown-menu show"
          style={{ position: "absolute", right: 0, top: "100%" }}
        >
          {LANGUAGES.map((lang) => (
            <li key={lang.code || "default"}>
              <button
                className="dropdown-item"
                onClick={() => translatePage(lang.code)}
              >
                {lang.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TranslateButton;

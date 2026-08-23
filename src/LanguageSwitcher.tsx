import { useNavigate } from "react-router-dom";
import { cvByLang, defaultLang, supportedLanguages } from "./lib/loadMarkdownCVs";

import "./LanguageSwitcher.css";

type Props = {
  currentLang: string;
};

export default function LanguageSwitcher({ currentLang }: Props) {
  const navigate = useNavigate();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    if (lang === defaultLang) {
      navigate("/");
    } else {
      navigate(`/${lang}`);
    }
  };

  const orderedLanguages = [
    defaultLang,
    ...supportedLanguages.filter((lang) => lang !== defaultLang),
  ];

  return (
    <div className="dropdown-container">
      <select
        className="fancy-dropdown"
        aria-label="Language"
        value={currentLang}
        onChange={handleLanguageChange}
      >
        {orderedLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {cvByLang[lang]?.label ?? lang}
          </option>
        ))}
      </select>
    </div>
  );
}

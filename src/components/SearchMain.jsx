import { useState } from "react";
import "../style/SearchMain.css"
/**
 * Componente de barra de búsqueda reutilizable
 *
 * @param {Function} onSearch - función que se ejecuta al hacer clic en "Buscar"
 */
export const SearchMain = ({onSearch}) => {
  const [term, setTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!term.trim()) return;
    onSearch(term);
  };

  return (
    <>
    <div>
      <h1 className="h1-title">Device tracking</h1>
    </div>
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search ID..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>
    </>
  );
};

export default SearchMain;

// Simplified and clarified letter form
export default function LetterForm() {
  return (
    <form className="letter-form">
      <h3>Step 2: Draft a Letter</h3>
      <label>Violation Type
        <select>
          <option>Noise</option>
          <option>Parking</option>
          <option>Trash</option>
        </select>
      </label>

      <label>Tone
        <select>
          <option>Friendly</option>
          <option>Neutral</option>
          <option>Firm</option>
        </select>
        <small>Choose how formal or friendly the letter should sound</small>
      </label>

      <label>Due Date <input type="date" /></label>
      <label>Rule Reference (optional) <input type="text" placeholder="e.g., Section 4.2 Parking" /></label>
      <button type="submit">Generate Letter</button>
    </form>
  );
}

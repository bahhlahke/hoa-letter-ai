// Community info storage
export default function CommunityProfileForm() {
  return (
    <form className="community-profile-form">
      <h3>Step 1: HOA Info</h3>
      <label>Guidelines (Paste text) <textarea /></label>
      <label>Guidelines URL (optional) <input type="url" /></label>
      <label>Letterhead (optional) <textarea /></label>
      <label>Logo (optional) <input type="file" /></label>
    </form>
  );
}

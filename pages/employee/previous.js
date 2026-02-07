export default function PreviousCompany() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Previous Company Details</h1>
      <form>
        <input type="text" placeholder="Company Name" /><br/>
        <input type="date" placeholder="Start Date" /><br/>
        <input type="date" placeholder="End Date" /><br/>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default function PersonalDetails() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Personal Details</h1>
      <form>
        <input type="text" placeholder="Name" /><br/>
        <input type="text" placeholder="Father Name" /><br/>
        <input type="text" placeholder="Aadhar Card" /><br/>
        <input type="text" placeholder="PAN Card" /><br/>
        <input type="text" placeholder="Mobile No" /><br/>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

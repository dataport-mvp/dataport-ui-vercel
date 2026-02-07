export default function UanDetails() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>UAN Details</h1>
      <form>
        <input type="text" placeholder="UAN" /><br/>
        <input type="text" placeholder="PF No" /><br/>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

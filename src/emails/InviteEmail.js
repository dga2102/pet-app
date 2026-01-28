export default function InviteEmail({ inviteUrl, householdName }) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "24px" }}>
      <h2>You’ve been invited to join {householdName}</h2>
      <p>
        Ready to make caring for your pets simpler? Click the link below to
        accept your invitation:
      </p>
      <p>
        <a href={inviteUrl} style={{ color: "#169126" }}>
          Accept Invitation
        </a>
      </p>
      <p>This link will expire in 24 hours.</p>
    </div>
  );
}

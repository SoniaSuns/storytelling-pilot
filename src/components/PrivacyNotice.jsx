export default function PrivacyNotice() {
  return (
    <div className="privacy-notice" role="note">
      <p>
        <strong>Privacy:</strong> This diary tool stores your entries locally in
        this browser using localStorage. Your data is not uploaded to a server.
        Please export your data as a JSON file and send it to the researcher if
        requested.
      </p>
      <p>
        Because this tool uses browser localStorage, your data may be lost if you
        clear browser data, use private browsing mode, or switch devices.
      </p>
    </div>
  )
}

import "./css/Header.css";
export const Header = ({ myName, setSwitchModule }) => {
  return (
    <div className="header">
      <div className="header_menu">
        <button
          onClick={() => setSwitchModule("profile")}
          className="header_button"
        >
          My profile
        </button>
        <button
          onClick={() => setSwitchModule("play")}
          className="header_button"
        >
          Play
        </button>
        <button
          onClick={() => setSwitchModule("friends")}
          className="header_button"
        >
          Friends
        </button>
        <p>Це акаунт користувача {myName}</p>
      </div>
    </div>
  );
};

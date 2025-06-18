import { FriendsMenu } from "./FriendsMenu";

export const Main = ({ ownerName }) => {
  return (
    <div>
      <div>Main Page</div>
      <p>Це акаунт користувача {ownerName}</p>
      <div>
        <FriendsMenu myName={ownerName} />
      </div>
    </div>
  );
};

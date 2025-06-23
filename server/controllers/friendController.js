const User = require("../models/user");
const { getSocketIDofOnlineUsersByName } = require("../config/socket");

const { getIO } = require("../config/socket");
const io = getIO();

async function findFriend(username, accOwner) {
  const existingUser = await User.findOne({ username }); // не забувай ставити {} в методі .findOne()
  if (!existingUser) {
    return {
      status: 400,
      body: { message: "A user with that name doesn't exist." },
    };
  }

  const checkExistingReq = existingUser.friendRequest.includes(accOwner);
  const checkExistingFriend = existingUser.friendList.includes(accOwner);

  if (checkExistingReq) {
    return {
      status: 200,
      body: {
        message: "You have already sent a friend request.",
        button: false,
      },
    };
  } else if (checkExistingFriend) {
    return {
      status: 200,
      body: { message: "You are friends.", button: false },
    };
  } else if (existingUser.username === accOwner) {
    return {
      status: 200,
      body: { message: "You are trying to find yourself.", button: false },
    };
  } else if (existingUser) {
    return {
      status: 200,
      body: {
        button: true,
        username: existingUser.username,
      },
    };
  }
}

async function friendRequest(accOwner, friendName) {
  const existingUser = await User.findOne({ username: friendName });
  const checkAccOwnerRequest = await User.findOne({ username: accOwner });
  if (!existingUser) {
    return {
      status: 400,
      body: { message: "No user with that name exists." },
    };
  }
  if (checkAccOwnerRequest.friendRequest.includes(friendName)) {
    return {
      status: 200,
      body: { message: "This user has already sent you friend request." },
    };
  }

  if (existingUser.friendRequest.includes(accOwner)) {
    return {
      status: 200,
      body: { message: "You have already sent friend request." },
    };
  }

  //Перевірка того, кому надсилають запит, чи є в списку запитів на дружбу ім'я того кто надіслав заявку

  //Перевірка того, кому надсилають запит, чи є в списку друзів ім'я того кто надіслав заявку
  else if (existingUser.friendList.includes(accOwner)) {
    return {
      status: 200,
      body: { message: "You are friends." },
    };
  } else {
    await User.updateOne(
      { username: friendName },
      { $push: { friendRequest: accOwner } }
    );

    console.log(
      `"\x1b[36m${accOwner}\x1b[0m" sent a friend request to: "\x1b[36m${friendName}\x1b[0m"`
    );

    return { status: 200, body: { message: "Friend request sent" } };
  }
}

async function acceptDeclinRequest(accOwner, friend, answer) {
  if (answer) {
    await User.updateOne(
      { username: accOwner },
      {
        $push: { friendList: friend },
        $pull: { friendRequest: friend },
      }
    );

    await User.updateOne(
      { username: friend },
      { $push: { friendList: accOwner } }
    );

    console.log(
      `"\x1b[36m${accOwner}\x1b[0m" and "\x1b[36m${friend}\x1b[0m" now friends.`
    );
    //відправити статус онлайн якшо друг, від якого ти прийняв запит, в онлайні

    const onlineUsersSockets = getSocketIDofOnlineUsersByName();
    if (onlineUsersSockets.get(friend)) {
      //відправити другу, заявку якого прийняв, статус онлайн
      io.to(onlineUsersSockets.get(friend)).emit("onlineStatusOfFriend", {
        friendName: accOwner,
        socketID: onlineUsersSockets.get(accOwner),
        onlineStatus: true,
      });

      // і собі в список відправити шо цей друг зараз онлайн
      io.to(onlineUsersSockets.get(accOwner)).emit("onlineStatusOfFriend", {
        friendName: friend,
        socketID: onlineUsersSockets.get(friend),
        onlineStatus: true,
      });
    }

    return {
      status: 200,
      body: { message: "User successfully added to friend list." },
    };
  } else {
    await User.updateOne(
      { username: accOwner },
      { $pull: { friendRequest: friend } }
    );
    console.log(
      `"\x1b[36m${accOwner}\x1b[0m" decline "\x1b[36m${friend}\x1b[0m" friends request.`
    );
    return {
      status: 200,
      body: { message: "Friend request successfully declined." },
    };
  }
}

async function getFriendList(accOwner) {
  const result = await User.findOne(accOwner);
  return {
    status: 200,
    body: { friendList: result.friendList },
  };
}

async function removeFriend(friend, accOwner) {
  await User.updateOne(
    { username: accOwner },
    {
      $pull: { friendList: friend },
    }
  );

  await User.updateOne(
    { username: friend },
    {
      $pull: { friendList: accOwner },
    }
  );
  console.log(
    `"\x1b[36m${accOwner}\x1b[0m" and "\x1b[36m${friend}\x1b[0m" are no longer friends.`
  );
  return {
    status: 200,
    body: {
      message: `User ${friend} was successfully removed from the friend list`,
    },
  };
}

//приймає масив імен користувача, і повертає масив об'єктів з іменами і їх socket.id
// async function getNameAndSocketID(arr) {
//   let arrOfObj = [];
//   for (let i = 0; i < arr.length; i++) {
//     const nameSocket = await User.findOne({ username: arr[i] });
//     arrOfObj.push({
//       friendName: nameSocket.username,
//       socketID: nameSocket.socketID,
//       onlineStatus: false,
//     });
//   }
//   return arrOfObj;
// }

module.exports = {
  findFriend,
  friendRequest,
  acceptDeclinRequest,
  getFriendList,
  removeFriend,
};

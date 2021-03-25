import React, {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  Text,
  TextInput,
  SafeAreaView
} from "react-native";
import Realm from "realm";

const usersSchema = {
  name: 'users',
  properties: {
    _id: 'string?',
    _partitionKey: 'string?',
    name: 'string?',
  },
  primaryKey: '_id',
};

function useRealm(props) {
  const [realm, setRealm] = useState(null);
  useEffect(async () => {
    const app = new Realm.App({"id": "application-0-abyjh"})
    await app.logIn(Realm.Credentials.function({"_id": props.userId}));
    const openRealmBehaviorConfiguration = {
      type: "openImmediately"
    };
    const realm = await Realm.open({
      "schema": [usersSchema],
      "sync": {
        user: app.currentUser,
        partitionValue: props.userId,
        newRealmFileBehavior: openRealmBehaviorConfiguration,
        existingRealmFileBehavior: openRealmBehaviorConfiguration
      }
    });
    setRealm(realm);
    return () => {
      realm.close();
    }
  }, [props.userId]);

  return realm;
}

export default function(props) {
  const userId = "QW5SVRZ4YWORLP2YVJZVO";  
  const realm = useRealm({userId});
  const [user, setUser] = useState(null);
  const [text, setText] = useState(user?.name);
  useEffect(() => {
    const user = realm?.objectForPrimaryKey("users", userId);
    setUser(user);
    setText(user?.name);
    const onUserChange = (user, changes) => {
      changes.changedProperties.forEach((prop) => {
        if (prop === "name") {
          setText(user[prop]);
        }
      })
    }
    user?.addListener(onUserChange);
    return () => {
      user?.removeListener(onUserChange);
    }
  }, [realm]);
  
  const onEndEditing = useCallback(() => {
    realm?.write(() => {
      user.name = text;
    });
  }, [realm, user, text]);
 
  return <SafeAreaView>
    <TextInput
      value={text}
      onChangeText={setText}
      onEndEditing={onEndEditing}
    />
  </SafeAreaView>
}

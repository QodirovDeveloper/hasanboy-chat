import React, { useRef, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { BiLogoTelegram } from "react-icons/bi";

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyBETJWBYqL7GoEFJBaGf62098bBbGIiXRs",
    authDomain: "hasanboy-chat-11c12.firebaseapp.com",
    projectId: "hasanboy-chat-11c12",
    storageBucket: "hasanboy-chat-11c12.appspot.com",
    messagingSenderId: "1046164496812",
    appId: "1:1046164496812:web:06547c78289d57ba45da09",
  });
}

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center">
      <header className="w-full bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">💬 Chat App</h1>
        <SignOut />
      </header>
      <section className="w-full max-w-2xl mt-4 p-4">
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <div className="flex justify-center">
      <button
        onClick={signInWithGoogle}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
      >
        Sign in with Google
      </button>
    </div>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button
        onClick={() => auth.signOut()}
        className="text-sm bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded"
      >
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(50);
  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main className="flex flex-col gap-2 mb-4 h-[60vh] overflow-y-auto p-2 bg-white rounded shadow">
        {messages &&
          messages.map((msg, idx) => (
            <ChatMessage key={msg.id || idx} message={msg} />
          ))}
        <div ref={dummy}></div>
      </main>

      <form
        onSubmit={sendMessage}
        className="flex gap-2 items-center bg-white p-3 rounded shadow"
      >
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="Type your message..."
        />
        <button
          type="submit"
          disabled={!formValue.trim()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          <BiLogoTelegram />

          {/* 🕊 */}
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "justify-end" : "justify-start";
  const bubbleColor = uid === auth.currentUser.uid ? "bg-blue-500 text-white" : "bg-gray-200";

  return (
    <div className={`flex ${messageClass}`}>
      <div className="flex items-end max-w-xs gap-2 mb-2">
        {uid !== auth.currentUser.uid && (
          <img
            src={photoURL || "/default-avatar.png"}
            alt="avatar"
            className="w-8 h-8 rounded-full"
          />
        )}
        <p className={`px-4 py-2 rounded-lg text-sm ${bubbleColor}`}>{text}</p>
        {uid === auth.currentUser.uid && (
          <img
            src={photoURL || "/default-avatar.png"}
            alt="avatar"
            className="w-8 h-8 rounded-full"
          />
        )}
      </div>
    </div>
  );
}

export default App;

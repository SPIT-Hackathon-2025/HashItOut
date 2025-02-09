import { useEffect, useState } from "react";
import { useSelf } from "@liveblocks/react/suspense";

export function Cursors({ yProvider }) {
  const userInfo = useSelf((me) => me.info);
  const [cursors, setCursors] = useState(new Map());
  const [localUserName, setLocalUserName] = useState('Anonymous');

  useEffect(() => {
    // Get user info from localStorage
    try {
      const storedData = localStorage.getItem('user');
      if (storedData) {
        const userData = JSON.parse(storedData);
        setLocalUserName(userData.name || 'Anonymous');
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
    }

    const updateCursors = () => {
      try {
        const newCursors = new Map();
        yProvider.awareness.getStates().forEach((state, clientId) => {
          if (state?.user && clientId !== yProvider.awareness.clientID) {
            newCursors.set(clientId, state);
          }
        });
        setCursors(newCursors);
      } catch (error) {
        console.error('Error updating cursors:', error);
      }
    };

    // Set initial user state in awareness
    const userColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    yProvider.awareness.setLocalStateField("user", {
      name: localUserName,
      color: userColor
    });

    yProvider.awareness.on("change", updateCursors);
    updateCursors();

    return () => {
      yProvider.awareness.off("change", updateCursors);
    };
  }, [yProvider, localUserName]);

  return (
    <div className="cursor-container">
      {Array.from(cursors.entries()).map(([clientId, state]) => (
        <div
          key={clientId}
          className="absolute transition-transform duration-100 ease-out"
          style={{ 
            left: `${state.user.position?.x}px`,
            top: `${state.user.position?.y}px`,
          }}
        >
          {/* Username label - always visible */}
          <div className="remote-cursor-name">
            {state.user.name || 'Anonymous'}
          </div>
          
          {/* Cursor line */}
          <div 
            className="remote-cursor"
            style={{ 
              '--cursor-color': state.user.color || '#4d84ff'
            }}
          />
        </div>
      ))}
    </div>
  );
}

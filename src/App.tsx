import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  Skull,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Users,
  Trash2,
  Plus,
  Minus,
  Maximize,
  Minimize,
} from "lucide-react";
import "./App.css";
import presetRolesData from "./roles.json";

type Team = "villager" | "werewolf" | "solo";

interface RoleDef {
  id: string;
  name: string;
  team: Team;
  description: string;
  playerName?: string;
}

interface Player {
  id: string;
  name?: string;
  role: RoleDef | null;
  isAlive: boolean;
  notes: string;
}

const PRESET_ROLES: RoleDef[] = presetRolesData as RoleDef[];

function App() {
  const [gameState, setGameState] = useState<"setup" | "playing">("setup");
  const [phase, setPhase] = useState<"day" | "night">("night");
  const [dayCount, setDayCount] = useState(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [roleDeck, setRoleDeck] = useState<RoleDef[]>([]);

  // Timer states
  const [defaultTimerSeconds, setDefaultTimerSeconds] = useState(120);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFullscreenTimer, setIsFullscreenTimer] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((sec) => sec - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  // Setup Actions
  const addRoleToDeck = (role: RoleDef) => {
    setRoleDeck((prev) => [
      ...prev,
      { ...role, id: Math.random().toString(36).substr(2, 9), playerName: "" },
    ]);
  };

  const updateRolePlayerName = (id: string, name: string) => {
    setRoleDeck((prev) =>
      prev.map((r) => (r.id === id ? { ...r, playerName: name } : r)),
    );
  };

  const removeRoleFromDeck = (id: string) => {
    setRoleDeck((prev) => prev.filter((r) => r.id !== id));
  };

  const assignRoles = () => {
    const shuffledRoles = [...roleDeck].sort(() => Math.random() - 0.5);
    const newPlayers: Player[] = shuffledRoles.map((role) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: role.playerName || "",
      role: role,
      isAlive: true,
      notes: "",
    }));
    setPlayers(newPlayers);
  };

  const startGame = () => {
    if (roleDeck.length === 0) {
      alert("Please add roles to the deck before starting!");
      return;
    }
    assignRoles();
    setGameState("playing");
    setPhase("night");
    setDayCount(1);
  };

  // Playing Actions
  const togglePhase = () => {
    if (phase === "night") {
      setPhase("day");
      setTimerSeconds(defaultTimerSeconds);
      setIsTimerRunning(false);
    } else {
      setPhase("night");
      setDayCount((prev) => prev + 1);
      setIsTimerRunning(false);
    }
  };

  const toggleAlive = (id: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isAlive: !p.isAlive } : p)),
    );
  };

  const updateNotes = (id: string, notes: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, notes } : p)));
  };

  const updateName = (id: string, name: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const resetGame = () => {
    if (confirm("Are you sure you want to reset the game to setup phase?")) {
      setGameState("setup");
      setPhase("night");
      setDayCount(1);
      setIsTimerRunning(false);
      setTimerSeconds(120);
      setDefaultTimerSeconds(120);
      // Reset players
      setPlayers([]);
    }
  };

  return (
    <>
      <header style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1>Ultimate Werewolf Moderator</h1>
      </header>

      <main>
        <AnimatePresence mode="wait">
          {gameState === "setup" ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="panel"
            >
              <div className="setup-container">
                {/* Setup Instructions Column */}
                <div>
                  <h2 className="flex-row mb-1">
                    <Users /> Game Setup
                  </h2>
                  <p
                    style={{ marginBottom: "1rem", color: "var(--text-muted)" }}
                  >
                    Add roles to your deck. When you start the game, players
                    will be automatically generated and randomly assigned these
                    roles.
                  </p>

                  <div className="flex-col mt-2">
                    <button
                      onClick={startGame}
                      className="primary-btn flex-row"
                      style={{ justifyContent: "center" }}
                    >
                      <Play size={18} /> Start Game
                    </button>
                  </div>
                </div>

                {/* Roles Column */}
                <div>
                  <h2 className="flex-row mb-1">
                    <Settings /> Roles Deck
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                      marginBottom: "1rem",
                    }}
                  >
                    {PRESET_ROLES.map((role) => (
                      <button
                        key={"preset-" + role.id}
                        onClick={() => addRoleToDeck(role)}
                        style={{
                          padding: "0.4rem 0.8rem",
                          fontSize: "0.85rem",
                        }}
                      >
                        + {role.name}
                      </button>
                    ))}
                  </div>

                  <div className="list-container">
                    <AnimatePresence>
                      {roleDeck.map((r, i) => (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          key={r.id}
                          className={`list-item ${r.team}`}
                          style={{
                            flexDirection: "column",
                            alignItems: "flex-start",
                            gap: "0.5rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              width: "100%",
                              alignItems: "center",
                            }}
                          >
                            <span style={{ fontWeight: "bold" }}>
                              {i + 1}. {r.name}
                            </span>
                            <button
                              onClick={() => removeRoleFromDeck(r.id)}
                              className="delete-btn"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <span
                            style={{
                              fontSize: "0.85rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            {r.description}
                          </span>
                          <input
                            type="text"
                            placeholder="Player Name"
                            value={r.playerName || ""}
                            onChange={(e) =>
                              updateRolePlayerName(r.id, e.target.value)
                            }
                            style={{
                              marginTop: "0.5rem",
                              width: "100%",
                              padding: "0.4rem 0.8rem",
                              fontSize: "0.9rem",
                              background: "rgba(0,0,0,0.3)",
                              border: "1px solid var(--panel-border)",
                              borderRadius: "4px",
                              color: "var(--text-main)",
                            }}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="play-phase-container"
            >
              <div className="status-bar">
                <div
                  style={{
                    display: "flex",
                    gap: "2rem",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div className={`phase-indicator ${phase}`}>
                    {phase === "day" ? <Sun size={32} /> : <Moon size={32} />}
                    <span>
                      {phase === "day" ? "Day" : "Night"} {dayCount}
                    </span>
                  </div>

                  {phase === "day" && (
                    <div
                      className="flex-row"
                      style={{
                        background: "rgba(0,0,0,0.2)",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                      }}
                    >
                      <button
                        onClick={() => {
                          const newTime = Math.max(0, timerSeconds - 60);
                          setTimerSeconds(newTime);
                          if (!isTimerRunning) setDefaultTimerSeconds(newTime);
                        }}
                        style={{
                          padding: "0.4rem",
                          background: "transparent",
                          border: "1px solid var(--panel-border)",
                        }}
                        title="- 1 Min"
                      >
                        <Minus size={14} />
                      </button>
                      <span
                        style={{
                          fontSize: "1.5rem",
                          fontFamily: "var(--font-serif)",
                          minWidth: "4rem",
                          textAlign: "center",
                        }}
                      >
                        {Math.floor(timerSeconds / 60)}:
                        {(timerSeconds % 60).toString().padStart(2, "0")}
                      </span>
                      <button
                        onClick={() => {
                          const newTime = timerSeconds + 60;
                          setTimerSeconds(newTime);
                          if (!isTimerRunning) setDefaultTimerSeconds(newTime);
                        }}
                        style={{
                          padding: "0.4rem",
                          background: "transparent",
                          border: "1px solid var(--panel-border)",
                        }}
                        title="+ 1 Min"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className={
                          isTimerRunning && timerSeconds > 0 ? "" : "blue-btn"
                        }
                        style={{
                          padding: "0.4rem",
                          border: "1px solid var(--panel-border)",
                          background:
                            isTimerRunning && timerSeconds > 0
                              ? "transparent"
                              : "",
                        }}
                        disabled={timerSeconds === 0}
                      >
                        {isTimerRunning && timerSeconds > 0 ? (
                          <Pause size={18} />
                        ) : (
                          <Play size={18} />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setTimerSeconds(defaultTimerSeconds);
                          setIsTimerRunning(false);
                        }}
                        style={{
                          padding: "0.4rem",
                          background: "transparent",
                          border: "1px solid var(--panel-border)",
                          color: "var(--accent-red)",
                        }}
                        title="Reset Timer"
                      >
                        <RotateCcw size={18} />
                      </button>
                      <button
                        onClick={() => setIsFullscreenTimer(true)}
                        style={{
                          padding: "0.4rem",
                          background: "transparent",
                          border: "1px solid var(--panel-border)",
                        }}
                        title="Fullscreen Timer"
                      >
                        <Maximize size={18} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex-row">
                  <button
                    onClick={togglePhase}
                    className={phase === "day" ? "blue-btn" : "primary-btn"}
                  >
                    Next Phase ({phase === "day" ? "Night" : "Day"})
                  </button>
                  <button
                    onClick={resetGame}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--panel-border)",
                    }}
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>
              </div>

              <div className="card-grid">
                {players.map((p) => (
                  <motion.div
                    layoutId={p.id}
                    key={p.id}
                    className={`player-card ${!p.isAlive ? "dead" : ""}`}
                  >
                    <div className={`role-badge ${p.role?.team}`}>
                      {p.role?.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                        minHeight: "32px",
                      }}
                    >
                      {!p.isAlive && (
                        <Skull color="var(--accent-red)" size={20} />
                      )}
                      {/* Using the original role id for identification since names are removed */}
                      <input
                        type="text"
                        placeholder={`Player ${p.id.slice(0, 4).toUpperCase()}`}
                        value={p.name || ""}
                        onChange={(e) => updateName(p.id, e.target.value)}
                        style={{
                          margin: 0,
                          fontSize: "1.2rem",
                          fontWeight: "bold",
                          background: "transparent",
                          border: "none",
                          borderBottom: "1px dashed var(--panel-border)",
                          padding: "0.2rem",
                          width: "100%",
                          outline: "none",
                          color: "var(--text-main)",
                          fontFamily: "var(--font-serif)",
                        }}
                      />
                    </div>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        marginBottom: "1rem",
                        minHeight: "3em",
                      }}
                    >
                      {p.role?.description}
                    </p>

                    <input
                      type="text"
                      placeholder="Moderator notes... (e.g. killed by wolf)"
                      value={p.notes}
                      onChange={(e) => updateNotes(p.id, e.target.value)}
                      style={{
                        width: "100%",
                        marginTop: "0.5rem",
                        fontSize: "0.85rem",
                        padding: "0.5rem",
                      }}
                    />

                    <div className="player-actions">
                      <button
                        onClick={() => toggleAlive(p.id)}
                        className={`action-btn ${p.isAlive ? "kill" : ""}`}
                      >
                        {p.isAlive ? "Mark Dead" : "Revive"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Fullscreen Timer Overlay */}
              <AnimatePresence>
                {isFullscreenTimer && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 100,
                      background: "rgba(11, 13, 23, 0.95)",
                      backdropFilter: "blur(20px)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "15rem",
                        fontFamily: "var(--font-serif)",
                        fontWeight: "bold",
                        textShadow: "0 0 40px rgba(255,255,255,0.2)",
                      }}
                    >
                      {Math.floor(timerSeconds / 60)}:
                      {(timerSeconds % 60).toString().padStart(2, "0")}
                    </div>

                    <div
                      className="flex-row"
                      style={{ marginTop: "2rem", transform: "scale(1.5)" }}
                    >
                      <button
                        onClick={() => {
                          const newTime = Math.max(0, timerSeconds - 60);
                          setTimerSeconds(newTime);
                          if (!isTimerRunning) setDefaultTimerSeconds(newTime);
                        }}
                        style={{
                          padding: "1rem",
                          background: "rgba(255,255,255,0.1)",
                        }}
                      >
                        <Minus size={24} />
                      </button>

                      <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className={
                          isTimerRunning && timerSeconds > 0 ? "" : "blue-btn"
                        }
                        style={{
                          padding: "1rem 2rem",
                          fontSize: "1.2rem",
                          marginLeft: "1rem",
                          marginRight: "1rem",
                        }}
                        disabled={timerSeconds === 0}
                      >
                        {isTimerRunning && timerSeconds > 0 ? "PAUSE" : "PLAY"}
                      </button>

                      <button
                        onClick={() => {
                          const newTime = timerSeconds + 60;
                          setTimerSeconds(newTime);
                          if (!isTimerRunning) setDefaultTimerSeconds(newTime);
                        }}
                        style={{
                          padding: "1rem",
                          background: "rgba(255,255,255,0.1)",
                        }}
                      >
                        <Plus size={24} />
                      </button>
                    </div>

                    <div
                      className="flex-row"
                      style={{ marginTop: "3rem", gap: "2rem" }}
                    >
                      <button
                        onClick={() => {
                          setTimerSeconds(defaultTimerSeconds);
                          setIsTimerRunning(false);
                        }}
                        style={{
                          padding: "0.8rem 1.5rem",
                          background: "transparent",
                          border: "1px solid var(--accent-red)",
                          color: "var(--accent-red)",
                        }}
                      >
                        <RotateCcw
                          size={20}
                          style={{ marginRight: "0.5rem" }}
                        />{" "}
                        Reset
                      </button>

                      <button
                        onClick={() => setIsFullscreenTimer(false)}
                        style={{
                          padding: "0.8rem 1.5rem",
                          background: "transparent",
                          border: "1px solid var(--panel-border)",
                        }}
                      >
                        <Minimize size={20} style={{ marginRight: "0.5rem" }} />{" "}
                        Close Fullscreen
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}

export default App;

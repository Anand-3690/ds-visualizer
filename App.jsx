import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";

/* ============================================================================
   THEME — shared across every module
   ============================================================================ */
const ACCENT = "#7dd3c0";
const ACCENT_DIM = "#2a5f57";
const ACCENT_SOFT = "#173430";
const HIT = "#f2b950";
const MISS = "#e5675f";
const VISITING = "#5b9bd1";
const BG = "#0f1614";
const PANEL = "#141d1b";
const PANEL_RAISED = "#101c19";
const LINE = "#284440";
const TEXT = "#eaf3f0";
const SUBTEXT = "#7b9490";
const FONT =
  "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace";
const ANIM_MS = 900;
const NODE_R = 20;

/* ============================================================================
   SHARED UI PRIMITIVES
   ============================================================================ */
function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      {label && (
        <div style={{ fontSize: 11, color: SUBTEXT, marginBottom: 4, letterSpacing: 1 }}>
          {label.toUpperCase()}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {children}
      </div>
    </div>
  );
}

function Select({ value, onChange, options, placeholder, width }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) || e.target.value : "")}
      style={{
        padding: "8px 10px",
        background: PANEL,
        border: `1px solid ${LINE}`,
        borderRadius: 6,
        color: value !== "" && value !== undefined ? TEXT : SUBTEXT,
        fontFamily: "inherit",
        fontSize: 13,
        outline: "none",
        minWidth: width || 90,
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function TextInput({ value, onChange, placeholder, width, type }) {
  return (
    <input
      type={type || "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        padding: "8px 10px",
        background: PANEL,
        border: `1px solid ${LINE}`,
        borderRadius: 6,
        color: TEXT,
        fontFamily: "inherit",
        fontSize: 13,
        outline: "none",
        width: width || 90,
        boxSizing: "border-box",
      }}
    />
  );
}

function Button({ onClick, label, primary, ghost, danger, disabled, small }) {
  const [hover, setHover] = useState(false);
  const base = {
    padding: small ? "6px 12px" : "9px 16px",
    borderRadius: 6,
    fontFamily: "inherit",
    fontSize: small ? 12 : 13,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    border: `1px solid ${
      disabled ? LINE : primary ? ACCENT : danger ? MISS : LINE
    }`,
    background: disabled
      ? PANEL
      : primary
      ? hover
        ? "#8fe0cd"
        : ACCENT
      : danger
      ? hover
        ? "#3a1f1d"
        : "transparent"
      : ghost
      ? "transparent"
      : hover
      ? "#1c2b28"
      : PANEL,
    color: disabled ? SUBTEXT : primary ? "#0c1a17" : danger ? MISS : ghost ? SUBTEXT : TEXT,
    opacity: disabled ? 0.5 : 1,
    transition: "all 0.15s",
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={base}
    >
      {label}
    </button>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {label}
    </div>
  );
}

function Legend({ items }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 18,
        marginTop: 14,
        fontSize: 12,
        color: SUBTEXT,
        flexWrap: "wrap",
      }}
    >
      {items.map((it, i) => (
        <LegendDot key={i} color={it.color} label={it.label} />
      ))}
    </div>
  );
}

function ModuleHeader({ eyebrow, title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontSize: 12,
          letterSpacing: 3,
          color: ACCENT,
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {eyebrow}
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, color: TEXT }}>{title}</div>
      <div style={{ fontSize: 13, color: SUBTEXT, marginTop: 4, lineHeight: 1.5 }}>
        {subtitle}
      </div>
    </div>
  );
}

function InfoBox({ info }) {
  if (!info) return null;
  return (
    <div
      style={{
        background: PANEL_RAISED,
        border: `1px solid ${ACCENT_DIM}`,
        borderRadius: 8,
        padding: "12px 14px",
        marginBottom: 10,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, marginBottom: 4 }}>
        {info.title}
      </div>
      <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.5 }}>{info.description}</div>
    </div>
  );
}

function StatusBar({ status, kind }) {
  return (
    <div
      style={{
        background: PANEL,
        border: `1px solid ${LINE}`,
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 13,
        marginBottom: 10,
        color: kind === "hit" ? ACCENT : kind === "miss" ? MISS : SUBTEXT,
        minHeight: 18,
        transition: "color 0.2s",
      }}
    >
      {status}
    </div>
  );
}

function StepLog({ lines }) {
  if (!lines || lines.length === 0) return null;
  return (
    <div
      style={{
        background: PANEL,
        border: `1px solid ${LINE}`,
        borderRadius: 8,
        padding: "12px 14px",
        marginBottom: 12,
      }}
    >
      <div style={{ fontSize: 12, color: SUBTEXT, marginBottom: 8 }}>Step by step:</div>
      <ol style={{ margin: 0, paddingLeft: 18 }}>
        {lines.map((line, i) => {
          const isCurrent = i === lines.length - 1;
          return (
            <li
              key={i}
              style={{
                fontSize: 13,
                lineHeight: 1.8,
                color: isCurrent ? ACCENT : SUBTEXT,
                fontWeight: isCurrent ? 700 : 400,
              }}
            >
              {line}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Chips({ label, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div
      style={{
        background: PANEL,
        border: `1px solid ${LINE}`,
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 13,
        marginBottom: 16,
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
      }}
    >
      <span style={{ color: SUBTEXT, fontSize: 12 }}>{label}</span>
      {items.map((k, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              background: ACCENT_SOFT,
              border: `1px solid ${ACCENT_DIM}`,
              borderRadius: 4,
              padding: "2px 8px",
              color: ACCENT,
              fontWeight: 700,
            }}
          >
            {k}
          </span>
          {i < items.length - 1 && <span style={{ color: SUBTEXT }}>&rarr;</span>}
        </span>
      ))}
    </div>
  );
}

function Canvas({ children, empty, height }) {
  return (
    <div
      style={{
        background: PANEL,
        border: `1px solid ${LINE}`,
        borderRadius: 10,
        padding: 14,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: height || 120,
        overflowX: "auto",
      }}
    >
      {empty ? (
        <div style={{ color: SUBTEXT, fontSize: 13, padding: "40px 0" }}>{empty}</div>
      ) : (
        children
      )}
    </div>
  );
}

/* Generic frame player: takes an array of frame objects (each with a `desc`
   string plus whatever fields the module needs) and steps through them on a
   timer, applying each frame to view state and appending its desc to the log. */
function usePlayer() {
  const timerRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPlaying(false);
  }, []);

  const run = useCallback(
    (frames, onFrame, onDone, speed) => {
      stop();
      if (!frames || frames.length === 0) {
        onDone && onDone();
        return;
      }
      setPlaying(true);
      let i = -1;
      timerRef.current = setInterval(() => {
        i += 1;
        onFrame(frames[i], i);
        if (i >= frames.length - 1) {
          stop();
          onDone && onDone();
        }
      }, speed || ANIM_MS);
    },
    [stop]
  );

  useEffect(() => stop, [stop]);
  return { run, stop, playing };
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ============================================================================
   ARRAY
   ============================================================================ */
const ARR_MAX = 10;

function markColor(kind) {
  if (kind === "hit") return HIT;
  if (kind === "miss") return MISS;
  if (kind === "active") return VISITING;
  if (kind === "shift") return ACCENT;
  if (kind === "range") return ACCENT_DIM;
  return LINE;
}

function buildPushFrames(arr, value) {
  const newArr = [...arr, value];
  return {
    frames: [
      {
        arr: newArr,
        marks: { [newArr.length - 1]: "hit" },
        desc: `Append ${value} at index ${newArr.length - 1} \u2014 O(1), we just write past the last used slot.`,
      },
    ],
    finalArr: newArr,
  };
}

function buildInsertFrames(arr, index, value) {
  const marks = {};
  for (let k = index; k < arr.length; k++) marks[k] = "shift";
  const newArr = [...arr];
  newArr.splice(index, 0, value);
  return {
    frames: [
      {
        arr: [...arr],
        marks,
        desc: `To open up index ${index}, shift every element from index ${index} onward one slot to the right.`,
      },
      {
        arr: newArr,
        marks: { [index]: "hit" },
        desc: `Write ${value} into the now-free index ${index}. Length becomes ${newArr.length}.`,
      },
    ],
    finalArr: newArr,
  };
}

function buildRemoveFrames(arr, index) {
  const removed = arr[index];
  const newArr = [...arr];
  newArr.splice(index, 1);
  const marks = {};
  for (let k = index; k < newArr.length; k++) marks[k] = "shift";
  return {
    frames: [
      { arr: [...arr], marks: { [index]: "miss" }, desc: `Remove the value at index ${index} (${removed}).` },
      {
        arr: newArr,
        marks,
        desc: `Shift every element after index ${index} one slot left to close the gap. Length becomes ${newArr.length}.`,
      },
    ],
    finalArr: newArr,
  };
}

function buildUpdateFrames(arr, index, value) {
  const newArr = [...arr];
  newArr[index] = value;
  return {
    frames: [
      {
        arr: newArr,
        marks: { [index]: "hit" },
        desc: `Direct access: write ${value} straight into index ${index} \u2014 O(1), no shifting needed.`,
      },
    ],
    finalArr: newArr,
  };
}

function buildLinearSearchFrames(arr, target) {
  const frames = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      frames.push({ arr: [...arr], marks: { [i]: "hit" }, desc: `arr[${i}] = ${arr[i]} \u2014 matches ${target}. Found!` });
      return { frames, found: true, index: i };
    }
    frames.push({ arr: [...arr], marks: { [i]: "active" }, desc: `arr[${i}] = ${arr[i]} \u2260 ${target}. Keep scanning \u2014 O(n) worst case.` });
  }
  frames.push({ arr: [...arr], marks: {}, desc: `Reached the end without a match.` });
  return { frames, found: false, index: -1 };
}

function buildBinarySearchFrames(arr, target) {
  const frames = [];
  let lo = 0,
    hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const marks = { [lo]: "range", [hi]: "range", [mid]: "active" };
    if (arr[mid] === target) {
      frames.push({ arr: [...arr], marks: { ...marks, [mid]: "hit" }, desc: `mid=${mid}, arr[${mid}]=${arr[mid]} equals ${target}. Found!` });
      return { frames, found: true, index: mid };
    }
    if (arr[mid] < target) {
      frames.push({ arr: [...arr], marks, desc: `mid=${mid}, arr[${mid}]=${arr[mid]} < ${target} \u2014 search the right half [${mid + 1}, ${hi}].` });
      lo = mid + 1;
    } else {
      frames.push({ arr: [...arr], marks, desc: `mid=${mid}, arr[${mid}]=${arr[mid]} > ${target} \u2014 search the left half [${lo}, ${mid - 1}].` });
      hi = mid - 1;
    }
  }
  frames.push({ arr: [...arr], marks: {}, desc: `Search range is empty \u2014 ${target} is not in the array.` });
  return { frames, found: false, index: -1 };
}

function ArrayModule() {
  const [data, setData] = useState([12, 45, 3, 89, 27]);
  const [view, setView] = useState({ arr: [12, 45, 3, 89, 27], marks: {} });
  const [sorted, setSorted] = useState(false);

  const [pushVal, setPushVal] = useState("");
  const [insVal, setInsVal] = useState("");
  const [insIdx, setInsIdx] = useState("");
  const [updVal, setUpdVal] = useState("");
  const [updIdx, setUpdIdx] = useState("");
  const [rmIdx, setRmIdx] = useState("");
  const [searchVal, setSearchVal] = useState("");

  const [status, setStatus] = useState("An array stores elements in contiguous, index-addressable slots.");
  const [resultKind, setResultKind] = useState(null);
  const [operationInfo, setOperationInfo] = useState(null);
  const [stepLog, setStepLog] = useState([]);
  const player = usePlayer();

  useEffect(() => {
    if (!player.playing) setView({ arr: data, marks: {} });
  }, [data]); // eslint-disable-line

  const runOp = (frames, info, onDone) => {
    setOperationInfo(info);
    setStepLog([]);
    setResultKind(null);
    player.run(
      frames,
      (frame) => {
        setView(frame);
        setStepLog((prev) => [...prev, frame.desc]);
      },
      onDone
    );
  };

  const handlePush = () => {
    const v = Number(pushVal);
    if (pushVal === "" || Number.isNaN(v)) return setStatus("Enter a numeric value to push.");
    if (data.length >= ARR_MAX) return setStatus(`Array is full (max ${ARR_MAX} for this demo).`);
    const { frames, finalArr } = buildPushFrames(data, v);
    runOp(frames, { title: "Push / Append", description: "Add a value at the end \u2014 the cheapest array write since nothing needs to move." }, () => {
      setData(finalArr);
      setSorted(false);
      setStatus(`Pushed ${v}. Length is now ${finalArr.length}.`);
      setResultKind("hit");
    });
    setPushVal("");
  };

  const handleInsert = () => {
    const v = Number(insVal);
    const i = Number(insIdx);
    if (insVal === "" || Number.isNaN(v)) return setStatus("Enter a numeric value to insert.");
    if (insIdx === "" || Number.isNaN(i) || i < 0 || i > data.length) return setStatus(`Index must be between 0 and ${data.length}.`);
    if (data.length >= ARR_MAX) return setStatus(`Array is full (max ${ARR_MAX} for this demo).`);
    const { frames, finalArr } = buildInsertFrames(data, i, v);
    runOp(frames, { title: `Insert at index ${i}`, description: "Inserting in the middle costs O(n) \u2014 every element after the index must shift right first." }, () => {
      setData(finalArr);
      setSorted(false);
      setStatus(`Inserted ${v} at index ${i}.`);
      setResultKind("hit");
    });
    setInsVal("");
    setInsIdx("");
  };

  const handleUpdate = () => {
    const v = Number(updVal);
    const i = Number(updIdx);
    if (updVal === "" || Number.isNaN(v)) return setStatus("Enter a numeric value to write.");
    if (updIdx === "" || Number.isNaN(i) || i < 0 || i >= data.length) return setStatus(`Index must be between 0 and ${data.length - 1}.`);
    const { frames, finalArr } = buildUpdateFrames(data, i, v);
    runOp(frames, { title: `Update index ${i}`, description: "Because arrays are index-addressable, writing to a known index is O(1)." }, () => {
      setData(finalArr);
      setSorted(false);
      setStatus(`Set index ${i} to ${v}.`);
      setResultKind("hit");
    });
    setUpdVal("");
    setUpdIdx("");
  };

  const handleRemove = () => {
    const i = Number(rmIdx);
    if (rmIdx === "" || Number.isNaN(i) || i < 0 || i >= data.length) return setStatus(`Index must be between 0 and ${data.length - 1}.`);
    const { frames, finalArr } = buildRemoveFrames(data, i);
    runOp(frames, { title: `Remove index ${i}`, description: "Removing from the middle is O(n) \u2014 the gap must be closed by shifting later elements left." }, () => {
      setData(finalArr);
      setStatus(`Removed index ${i}.`);
      setResultKind("miss");
    });
    setRmIdx("");
  };

  const handleLinearSearch = () => {
    const v = Number(searchVal);
    if (searchVal === "" || Number.isNaN(v)) return setStatus("Enter a value to search for.");
    const { frames, found } = buildLinearSearchFrames(data, v);
    runOp(frames, { title: `Linear search for ${v}`, description: "Check every element in order until we find a match or run out of elements \u2014 O(n)." }, () => {
      setStatus(found ? `Found ${v}.` : `${v} is not in the array.`);
      setResultKind(found ? "hit" : "miss");
    });
  };

  const handleBinarySearch = () => {
    const v = Number(searchVal);
    if (searchVal === "" || Number.isNaN(v)) return setStatus("Enter a value to search for.");
    if (!sorted) return setStatus("Binary search needs a sorted array \u2014 click \u201cSort ascending\u201d first.");
    const { frames, found } = buildBinarySearchFrames(data, v);
    runOp(frames, { title: `Binary search for ${v}`, description: "Repeatedly halve the search range by comparing against the middle element \u2014 O(log n) on a sorted array." }, () => {
      setStatus(found ? `Found ${v}.` : `${v} is not in the array.`);
      setResultKind(found ? "hit" : "miss");
    });
  };

  const handleSort = () => {
    const sortedArr = [...data].sort((a, b) => a - b);
    setData(sortedArr);
    setSorted(true);
    setOperationInfo(null);
    setStepLog([]);
    setResultKind(null);
    setStatus("Sorted ascending \u2014 binary search is now available.");
  };

  const handleRandom = () => {
    player.stop();
    const n = randInt(5, 8);
    const arr = Array.from({ length: n }, () => randInt(1, 99));
    setData(arr);
    setView({ arr, marks: {} });
    setSorted(false);
    setOperationInfo(null);
    setStepLog([]);
    setResultKind(null);
    setStatus("Generated a random array.");
  };

  const handleClear = () => {
    player.stop();
    setData([]);
    setView({ arr: [], marks: {} });
    setSorted(false);
    setOperationInfo(null);
    setStepLog([]);
    setResultKind(null);
    setStatus("Cleared. Push or insert some values to begin.");
  };

  return (
    <div>
      <ModuleHeader
        eyebrow="Array"
        title="Contiguous, index-addressed storage"
        subtitle="Fixed-size, indexed slots in memory. O(1) read/write by index, but insert and remove in the middle require shifting elements."
      />

      <Section label="Add">
        <TextInput value={pushVal} onChange={setPushVal} placeholder="value" width={70} type="number" />
        <Button onClick={handlePush} label="Push (end)" primary disabled={data.length >= ARR_MAX} />
      </Section>

      <Section label="Insert">
        <TextInput value={insVal} onChange={setInsVal} placeholder="value" width={70} type="number" />
        <TextInput value={insIdx} onChange={setInsIdx} placeholder="index" width={60} type="number" />
        <Button onClick={handleInsert} label="Insert" primary disabled={data.length >= ARR_MAX} />
      </Section>

      <Section label="Update">
        <TextInput value={updVal} onChange={setUpdVal} placeholder="value" width={70} type="number" />
        <TextInput value={updIdx} onChange={setUpdIdx} placeholder="index" width={60} type="number" />
        <Button onClick={handleUpdate} label="Set" disabled={data.length === 0} />
      </Section>

      <Section label="Remove">
        <TextInput value={rmIdx} onChange={setRmIdx} placeholder="index" width={60} type="number" />
        <Button onClick={handleRemove} label="Remove" ghost disabled={data.length === 0} />
        <div style={{ flex: 1 }} />
        <Button onClick={handleSort} label="Sort ascending" ghost disabled={data.length < 2} />
        <Button onClick={handleRandom} label="Random array" ghost />
        <Button onClick={handleClear} label="Clear" ghost />
      </Section>

      <Section label="Search">
        <TextInput value={searchVal} onChange={setSearchVal} placeholder="value" width={70} type="number" />
        <Button onClick={handleLinearSearch} label="Linear search" disabled={data.length === 0} />
        <Button onClick={handleBinarySearch} label="Binary search" disabled={data.length === 0 || !sorted} />
      </Section>

      <InfoBox info={operationInfo} />
      <StatusBar status={status} kind={resultKind} />
      <StepLog lines={stepLog} />

      <Canvas empty={data.length === 0 ? "(empty array)" : null}>
        <div style={{ display: "flex", gap: 4 }}>
          {view.arr.map((v, i) => {
            const kind = view.marks && view.marks[i];
            const color = markColor(kind);
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 10, color: SUBTEXT }}>{i}</div>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 6,
                    border: `2px solid ${kind ? color : LINE}`,
                    background: kind === "hit" ? color : kind ? "#173430" : PANEL_RAISED,
                    color: kind === "hit" ? "#1a1408" : TEXT,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    transition: "all 0.2s",
                  }}
                >
                  {v}
                </div>
              </div>
            );
          })}
        </div>
      </Canvas>

      <Legend
        items={[
          { color: VISITING, label: "comparing" },
          { color: ACCENT, label: "shifting" },
          { color: ACCENT_DIM, label: "search range bound" },
          { color: HIT, label: "found / written" },
          { color: MISS, label: "removed / not found" },
        ]}
      />
    </div>
  );
}

/* ============================================================================
   STACK
   ============================================================================ */
const STACK_MAX = 8;

function buildStackPushFrames(stack, value) {
  const newStack = [...stack, value];
  return {
    frames: [{ stack: newStack, marks: { [newStack.length - 1]: "hit" }, desc: `Push ${value} onto the top of the stack.` }],
    finalStack: newStack,
  };
}

function buildStackPopFrames(stack) {
  const top = stack[stack.length - 1];
  const newStack = stack.slice(0, -1);
  return {
    frames: [{ stack: [...stack], marks: { [stack.length - 1]: "miss" }, desc: `Pop the top element (${top}) off the stack.` }],
    finalStack: newStack,
    value: top,
  };
}

function buildStackPeekFrames(stack) {
  const top = stack[stack.length - 1];
  return {
    frames: [{ stack: [...stack], marks: { [stack.length - 1]: "active" }, desc: `Peek at the top element (${top}) \u2014 read only, nothing is removed.` }],
    value: top,
  };
}

function StackModule() {
  const [data, setData] = useState([4, 17, 8]);
  const [view, setView] = useState({ stack: [4, 17, 8], marks: {} });
  const [pushVal, setPushVal] = useState("");
  const [status, setStatus] = useState("A stack is LIFO \u2014 last in, first out. You can only add or remove from the top.");
  const [resultKind, setResultKind] = useState(null);
  const [operationInfo, setOperationInfo] = useState(null);
  const [stepLog, setStepLog] = useState([]);
  const player = usePlayer();

  useEffect(() => {
    if (!player.playing) setView({ stack: data, marks: {} });
  }, [data]); // eslint-disable-line

  const runOp = (frames, info, onDone) => {
    setOperationInfo(info);
    setStepLog([]);
    setResultKind(null);
    player.run(frames, (frame) => {
      setView(frame);
      setStepLog((prev) => [...prev, frame.desc]);
    }, onDone);
  };

  const handlePush = () => {
    const v = Number(pushVal);
    if (pushVal === "" || Number.isNaN(v)) return setStatus("Enter a numeric value to push.");
    if (data.length >= STACK_MAX) return setStatus(`Stack overflow \u2014 max ${STACK_MAX} for this demo.`);
    const { frames, finalStack } = buildStackPushFrames(data, v);
    runOp(frames, { title: "Push", description: "Add a new element on top. O(1) \u2014 no other element moves." }, () => {
      setData(finalStack);
      setStatus(`Pushed ${v}.`);
      setResultKind("hit");
    });
    setPushVal("");
  };

  const handlePop = () => {
    if (data.length === 0) return setStatus("Stack underflow \u2014 nothing to pop.");
    const { frames, finalStack, value } = buildStackPopFrames(data);
    runOp(frames, { title: "Pop", description: "Remove and return the top element. O(1) \u2014 only the top changes." }, () => {
      setData(finalStack);
      setStatus(`Popped ${value}.`);
      setResultKind("miss");
    });
  };

  const handlePeek = () => {
    if (data.length === 0) return setStatus("Stack is empty \u2014 nothing to peek.");
    const { frames, value } = buildStackPeekFrames(data);
    runOp(frames, { title: "Peek / Top", description: "Look at the top element without removing it." }, () => {
      setStatus(`Top of stack is ${value}.`);
      setResultKind("hit");
    });
  };

  const handleRandom = () => {
    player.stop();
    const n = randInt(3, 6);
    const arr = Array.from({ length: n }, () => randInt(1, 99));
    setData(arr);
    setView({ stack: arr, marks: {} });
    setOperationInfo(null);
    setStepLog([]);
    setResultKind(null);
    setStatus("Generated a random stack.");
  };

  const handleClear = () => {
    player.stop();
    setData([]);
    setView({ stack: [], marks: {} });
    setOperationInfo(null);
    setStepLog([]);
    setResultKind(null);
    setStatus("Cleared. Push a value to begin.");
  };

  return (
    <div>
      <ModuleHeader
        eyebrow="Stack"
        title="LIFO \u2014 Last In, First Out"
        subtitle="Push and pop only happen at the top, like a stack of plates. Used for undo history, call stacks, and expression parsing."
      />

      <Section label="Push">
        <TextInput value={pushVal} onChange={setPushVal} placeholder="value" width={80} type="number" />
        <Button onClick={handlePush} label="Push" primary disabled={data.length >= STACK_MAX} />
      </Section>
      <Section label="">
        <Button onClick={handlePop} label="Pop" disabled={data.length === 0} />
        <Button onClick={handlePeek} label="Peek" ghost disabled={data.length === 0} />
        <div style={{ flex: 1 }} />
        <Button onClick={handleRandom} label="Random stack" ghost />
        <Button onClick={handleClear} label="Clear" ghost />
      </Section>

      <InfoBox info={operationInfo} />
      <StatusBar status={status} kind={resultKind} />
      <StepLog lines={stepLog} />

      <Canvas empty={view.stack.length === 0 ? "(empty stack)" : null} height={220}>
        <div style={{ display: "flex", flexDirection: "column-reverse", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: 10, color: SUBTEXT, marginTop: 6 }}>base</div>
          {view.stack.map((v, i) => {
              const kind = view.marks && view.marks[i];
              const color = markColor(kind);
              const isTop = i === view.stack.length - 1;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 90,
                      height: 38,
                      borderRadius: 6,
                      border: `2px solid ${kind ? color : LINE}`,
                      background: kind === "hit" ? color : kind ? "#173430" : PANEL_RAISED,
                      color: kind === "hit" ? "#1a1408" : TEXT,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 700,
                      transition: "all 0.2s",
                    }}
                  >
                    {v}
                  </div>
                  {isTop && <span style={{ fontSize: 11, color: ACCENT }}>&larr; top</span>}
                </div>
              );
            })}
        </div>
      </Canvas>

      <Legend
        items={[
          { color: VISITING, label: "peeking" },
          { color: HIT, label: "pushed" },
          { color: MISS, label: "popped" },
        ]}
      />
    </div>
  );
}

/* ============================================================================
   QUEUE
   ============================================================================ */
const QUEUE_MAX = 8;

function buildEnqueueFrames(queue, value) {
  const newQueue = [...queue, value];
  return {
    frames: [{ queue: newQueue, marks: { [newQueue.length - 1]: "hit" }, desc: `Enqueue ${value} at the rear of the queue.` }],
    finalQueue: newQueue,
  };
}

function buildDequeueFrames(queue) {
  const front = queue[0];
  const newQueue = queue.slice(1);
  return {
    frames: [{ queue: [...queue], marks: { 0: "miss" }, desc: `Dequeue the front element (${front}). Everyone else moves one place closer to the front.` }],
    finalQueue: newQueue,
    value: front,
  };
}

function buildQueuePeekFrames(queue) {
  const front = queue[0];
  return {
    frames: [{ queue: [...queue], marks: { 0: "active" }, desc: `Peek at the front element (${front}) \u2014 read only.` }],
    value: front,
  };
}

function QueueModule() {
  const [data, setData] = useState([9, 21, 6]);
  const [view, setView] = useState({ queue: [9, 21, 6], marks: {} });
  const [enqVal, setEnqVal] = useState("");
  const [status, setStatus] = useState("A queue is FIFO \u2014 first in, first out. Add at the rear, remove from the front.");
  const [resultKind, setResultKind] = useState(null);
  const [operationInfo, setOperationInfo] = useState(null);
  const [stepLog, setStepLog] = useState([]);
  const player = usePlayer();

  useEffect(() => {
    if (!player.playing) setView({ queue: data, marks: {} });
  }, [data]); // eslint-disable-line

  const runOp = (frames, info, onDone) => {
    setOperationInfo(info);
    setStepLog([]);
    setResultKind(null);
    player.run(frames, (frame) => {
      setView(frame);
      setStepLog((prev) => [...prev, frame.desc]);
    }, onDone);
  };

  const handleEnqueue = () => {
    const v = Number(enqVal);
    if (enqVal === "" || Number.isNaN(v)) return setStatus("Enter a numeric value to enqueue.");
    if (data.length >= QUEUE_MAX) return setStatus(`Queue is full \u2014 max ${QUEUE_MAX} for this demo.`);
    const { frames, finalQueue } = buildEnqueueFrames(data, v);
    runOp(frames, { title: "Enqueue", description: "Add a new element at the rear. O(1)." }, () => {
      setData(finalQueue);
      setStatus(`Enqueued ${v}.`);
      setResultKind("hit");
    });
    setEnqVal("");
  };

  const handleDequeue = () => {
    if (data.length === 0) return setStatus("Queue is empty \u2014 nothing to dequeue.");
    const { frames, finalQueue, value } = buildDequeueFrames(data);
    runOp(frames, { title: "Dequeue", description: "Remove and return the front element. Everything shifts up by one \u2014 O(n) for an array-backed queue, O(1) with a linked list or ring buffer." }, () => {
      setData(finalQueue);
      setStatus(`Dequeued ${value}.`);
      setResultKind("miss");
    });
  };

  const handlePeek = () => {
    if (data.length === 0) return setStatus("Queue is empty \u2014 nothing to peek.");
    const { frames, value } = buildQueuePeekFrames(data);
    runOp(frames, { title: "Peek / Front", description: "Look at the front element without removing it." }, () => {
      setStatus(`Front of queue is ${value}.`);
      setResultKind("hit");
    });
  };

  const handleRandom = () => {
    player.stop();
    const n = randInt(3, 6);
    const arr = Array.from({ length: n }, () => randInt(1, 99));
    setData(arr);
    setView({ queue: arr, marks: {} });
    setOperationInfo(null);
    setStepLog([]);
    setResultKind(null);
    setStatus("Generated a random queue.");
  };

  const handleClear = () => {
    player.stop();
    setData([]);
    setView({ queue: [], marks: {} });
    setOperationInfo(null);
    setStepLog([]);
    setResultKind(null);
    setStatus("Cleared. Enqueue a value to begin.");
  };

  return (
    <div>
      <ModuleHeader
        eyebrow="Queue"
        title="FIFO \u2014 First In, First Out"
        subtitle="Like a checkout line: new items join at the rear, service happens at the front. Used for task scheduling, BFS, and buffering."
      />

      <Section label="Enqueue">
        <TextInput value={enqVal} onChange={setEnqVal} placeholder="value" width={80} type="number" />
        <Button onClick={handleEnqueue} label="Enqueue" primary disabled={data.length >= QUEUE_MAX} />
      </Section>
      <Section label="">
        <Button onClick={handleDequeue} label="Dequeue" disabled={data.length === 0} />
        <Button onClick={handlePeek} label="Peek front" ghost disabled={data.length === 0} />
        <div style={{ flex: 1 }} />
        <Button onClick={handleRandom} label="Random queue" ghost />
        <Button onClick={handleClear} label="Clear" ghost />
      </Section>

      <InfoBox info={operationInfo} />
      <StatusBar status={status} kind={resultKind} />
      <StepLog lines={stepLog} />

      <Canvas empty={view.queue.length === 0 ? "(empty queue)" : null}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {view.queue.map((v, i) => {
              const kind = view.marks && view.marks[i];
              const color = markColor(kind);
              return (
                <div
                  key={i}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 6,
                    border: `2px solid ${kind ? color : LINE}`,
                    background: kind === "hit" ? color : kind ? "#173430" : PANEL_RAISED,
                    color: kind === "hit" ? "#1a1408" : TEXT,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    transition: "all 0.2s",
                  }}
                >
                  {v}
                </div>
              );
            })}
          </div>
          {view.queue.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", width: view.queue.length * 50 - 4, fontSize: 11, color: ACCENT }}>
              <span>&uarr; front</span>
              {view.queue.length > 1 && <span>rear &uarr;</span>}
            </div>
          )}
        </div>
      </Canvas>

      <Legend
        items={[
          { color: VISITING, label: "peeking" },
          { color: HIT, label: "enqueued" },
          { color: MISS, label: "dequeued" },
        ]}
      />
    </div>
  );
}

/* ============================================================================
   LINKED LIST (singly linked)
   ============================================================================ */
const LIST_MAX = 9;
let llIdCounter = 1;

function buildLLInsertHeadFrames(list, value) {
  const node = { id: llIdCounter++, value };
  const newList = [node, ...list];
  return {
    frames: [{ list: newList, marks: { 0: "hit" }, desc: `Create a new node holding ${value}, point its next to the old head, then make it the new head.` }],
    finalList: newList,
  };
}

function buildLLInsertTailFrames(list, value) {
  const node = { id: llIdCounter++, value };
  const frames = [];
  if (list.length === 0) {
    return { frames: [{ list: [node], marks: { 0: "hit" }, desc: `List is empty \u2014 the new node becomes the head (and tail).` }], finalList: [node] };
  }
  for (let i = 0; i < list.length; i++) {
    const isLast = i === list.length - 1;
    frames.push({
      list: [...list],
      marks: { [i]: "active" },
      desc: isLast
        ? `Node ${i} (${list[i].value}) has next = null \u2014 this is the tail. Link the new node after it.`
        : `Follow the next pointer from node ${i} (${list[i].value}) to node ${i + 1}.`,
    });
  }
  const newList = [...list, node];
  frames.push({ list: newList, marks: { [newList.length - 1]: "hit" }, desc: `Insert ${value} after the old tail. This costs O(n) without a tail pointer, O(1) with one.` });
  return { frames, finalList: newList };
}

function buildLLInsertAtFrames(list, index, value) {
  const node = { id: llIdCounter++, value };
  const frames = [];
  for (let i = 0; i < index; i++) {
    frames.push({ list: [...list], marks: { [i]: "active" }, desc: `Traverse from node ${i} (${list[i].value}) following its next pointer.` });
  }
  const newList = [...list];
  newList.splice(index, 0, node);
  frames.push({
    list: newList,
    marks: { [index]: "hit" },
    desc: `Splice ${value} in at position ${index}: relink the previous node's next to this node, and this node's next to what used to follow \u2014 no data shifting required.`,
  });
  return { frames, finalList: newList };
}

function buildLLDeleteAtFrames(list, index) {
  const removed = list[index].value;
  const frames = [];
  for (let i = 0; i <= index; i++) {
    frames.push({ list: [...list], marks: { [i]: i === index ? "miss" : "active" }, desc: i === index ? `Found position ${index} (${removed}) \u2014 unlink it.` : `Traverse from node ${i} (${list[i].value}).` });
  }
  const newList = list.filter((_, i) => i !== index);
  frames.push({ list: newList, marks: {}, desc: `Relink: the previous node's next now points to what used to follow node ${index}.` });
  return { frames, finalList: newList, removed };
}

function buildLLTraverseFrames(list, target, stopOnMatch) {
  const frames = [];
  for (let i = 0; i < list.length; i++) {
    const isMatch = list[i].value === target;
    frames.push({
      list: [...list],
      marks: { [i]: isMatch ? "hit" : "active" },
      desc: isMatch ? `Node ${i} holds ${target} \u2014 match found!` : `Node ${i} holds ${list[i].value} \u2260 ${target}. Follow next.`,
    });
    if (isMatch && stopOnMatch) return { frames, found: true, index: i };
  }
  if (!list.some((n) => n.value === target)) {
    frames.push({ list: [...list], marks: {}, desc: `Reached null \u2014 ${target} is not in the list.` });
  }
  return { frames, found: list.some((n) => n.value === target), index: list.findIndex((n) => n.value === target) };
}

function LinkedListModule() {
  const [data, setData] = useState(() => [
    { id: llIdCounter++, value: 5 },
    { id: llIdCounter++, value: 18 },
    { id: llIdCounter++, value: 2 },
  ]);
  const [view, setView] = useState({ list: data, marks: {} });
  const [headVal, setHeadVal] = useState("");
  const [tailVal, setTailVal] = useState("");
  const [atVal, setAtVal] = useState("");
  const [atIdx, setAtIdx] = useState("");
  const [delIdx, setDelIdx] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [status, setStatus] = useState("A linked list is a chain of nodes; each node points to the next. No shifting on insert/delete \u2014 just relinking.");
  const [resultKind, setResultKind] = useState(null);
  const [operationInfo, setOperationInfo] = useState(null);
  const [stepLog, setStepLog] = useState([]);
  const player = usePlayer();

  useEffect(() => {
    if (!player.playing) setView({ list: data, marks: {} });
  }, [data]); // eslint-disable-line

  const runOp = (frames, info, onDone) => {
    setOperationInfo(info);
    setStepLog([]);
    setResultKind(null);
    player.run(frames, (frame) => {
      setView(frame);
      setStepLog((prev) => [...prev, frame.desc]);
    }, onDone, 750);
  };

  const handleInsertHead = () => {
    const v = Number(headVal);
    if (headVal === "" || Number.isNaN(v)) return setStatus("Enter a numeric value.");
    if (data.length >= LIST_MAX) return setStatus(`List is full \u2014 max ${LIST_MAX} for this demo.`);
    const { frames, finalList } = buildLLInsertHeadFrames(data, v);
    runOp(frames, { title: "Insert at head", description: "O(1) \u2014 no traversal needed, just repoint the head." }, () => {
      setData(finalList);
      setStatus(`Inserted ${v} at the head.`);
      setResultKind("hit");
    });
    setHeadVal("");
  };

  const handleInsertTail = () => {
    const v = Number(tailVal);
    if (tailVal === "" || Number.isNaN(v)) return setStatus("Enter a numeric value.");
    if (data.length >= LIST_MAX) return setStatus(`List is full \u2014 max ${LIST_MAX} for this demo.`);
    const { frames, finalList } = buildLLInsertTailFrames(data, v);
    runOp(frames, { title: "Insert at tail", description: "Without a tail pointer this needs a full traversal to find the last node \u2014 O(n)." }, () => {
      setData(finalList);
      setStatus(`Inserted ${v} at the tail.`);
      setResultKind("hit");
    });
    setTailVal("");
  };

  const handleInsertAt = () => {
    const v = Number(atVal);
    const i = Number(atIdx);
    if (atVal === "" || Number.isNaN(v)) return setStatus("Enter a numeric value.");
    if (atIdx === "" || Number.isNaN(i) || i < 0 || i > data.length) return setStatus(`Position must be between 0 and ${data.length}.`);
    if (data.length >= LIST_MAX) return setStatus(`List is full \u2014 max ${LIST_MAX} for this demo.`);
    const { frames, finalList } = buildLLInsertAtFrames(data, i, v);
    runOp(frames, { title: `Insert at position ${i}`, description: "Traverse to the position, then relink two pointers \u2014 O(n) to get there, O(1) to splice." }, () => {
      setData(finalList);
      setStatus(`Inserted ${v} at position ${i}.`);
      setResultKind("hit");
    });
    setAtVal("");
    setAtIdx("");
  };

  const handleDeleteAt = () => {
    const i = Number(delIdx);
    if (delIdx === "" || Number.isNaN(i) || i < 0 || i >= data.length) return setStatus(`Position must be between 0 and ${data.length - 1}.`);
    const { frames, finalList, removed } = buildLLDeleteAtFrames(data, i);
    runOp(frames, { title: `Delete position ${i}`, description: "Traverse to the node before the target, then repoint its next \u2014 skipping over the removed node." }, () => {
      setData(finalList);
      setStatus(`Deleted node at position ${i} (was ${removed}).`);
      setResultKind("miss");
    });
    setDelIdx("");
  };

  const handleSearch = () => {
    const v = Number(searchVal);
    if (searchVal === "" || Number.isNaN(v)) return setStatus("Enter a value to search for.");
    const { frames, found } = buildLLTraverseFrames(data, v, true);
    runOp(frames, { title: `Search for ${v}`, description: "No random access \u2014 walk node by node from the head. O(n)." }, () => {
      setStatus(found ? `Found ${v}.` : `${v} is not in the list.`);
      setResultKind(found ? "hit" : "miss");
    });
  };

  const handleRandom = () => {
    player.stop();
    const n = randInt(3, 6);
    const arr = Array.from({ length: n }, () => ({ id: llIdCounter++, value: randInt(1, 99) }));
    setData(arr);
    setView({ list: arr, marks: {} });
    setOperationInfo(null);
    setStepLog([]);
    setResultKind(null);
    setStatus("Generated a random linked list.");
  };

  const handleClear = () => {
    player.stop();
    setData([]);
    setView({ list: [], marks: {} });
    setOperationInfo(null);
    setStepLog([]);
    setResultKind(null);
    setStatus("Cleared. Insert a node to begin.");
  };

  return (
    <div>
      <ModuleHeader
        eyebrow="Linked List"
        title="A chain of nodes, linked by pointers"
        subtitle="Each node stores a value and a pointer to the next node. No contiguous memory or shifting \u2014 but no random access either."
      />

      <Section label="Insert at head">
        <TextInput value={headVal} onChange={setHeadVal} placeholder="value" width={80} type="number" />
        <Button onClick={handleInsertHead} label="Insert head" primary disabled={data.length >= LIST_MAX} />
      </Section>
      <Section label="Insert at tail">
        <TextInput value={tailVal} onChange={setTailVal} placeholder="value" width={80} type="number" />
        <Button onClick={handleInsertTail} label="Insert tail" primary disabled={data.length >= LIST_MAX} />
      </Section>
      <Section label="Insert at position">
        <TextInput value={atVal} onChange={setAtVal} placeholder="value" width={70} type="number" />
        <TextInput value={atIdx} onChange={setAtIdx} placeholder="pos" width={55} type="number" />
        <Button onClick={handleInsertAt} label="Insert" disabled={data.length >= LIST_MAX} />
      </Section>
      <Section label="Delete">
        <TextInput value={delIdx} onChange={setDelIdx} placeholder="pos" width={55} type="number" />
        <Button onClick={handleDeleteAt} label="Delete at position" ghost disabled={data.length === 0} />
        <div style={{ flex: 1 }} />
        <Button onClick={handleRandom} label="Random list" ghost />
        <Button onClick={handleClear} label="Clear" ghost />
      </Section>
      <Section label="Search">
        <TextInput value={searchVal} onChange={setSearchVal} placeholder="value" width={80} type="number" />
        <Button onClick={handleSearch} label="Search" disabled={data.length === 0} />
      </Section>

      <InfoBox info={operationInfo} />
      <StatusBar status={status} kind={resultKind} />
      <StepLog lines={stepLog} />

      <Canvas empty={view.list.length === 0 ? "(empty list)" : null}>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0 }}>
          <div style={{ fontSize: 11, color: ACCENT, marginRight: 6, fontWeight: 700 }}>head &rarr;</div>
          {view.list.map((n, i) => {
            const kind = view.marks && view.marks[i];
            const color = markColor(kind);
            return (
              <div key={n.id} style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    minWidth: 46,
                    height: 40,
                    padding: "0 10px",
                    borderRadius: 6,
                    border: `2px solid ${kind ? color : LINE}`,
                    background: kind === "hit" ? color : kind ? "#173430" : PANEL_RAISED,
                    color: kind === "hit" ? "#1a1408" : TEXT,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    transition: "all 0.2s",
                  }}
                >
                  {n.value}
                </div>
                <span style={{ color: SUBTEXT, margin: "0 6px", fontSize: 14 }}>&rarr;</span>
              </div>
            );
          })}
          <div style={{ fontSize: 12, color: SUBTEXT }}>null</div>
        </div>
      </Canvas>

      <Legend
        items={[
          { color: VISITING, label: "traversing" },
          { color: HIT, label: "inserted / match" },
          { color: MISS, label: "deleted" },
        ]}
      />
    </div>
  );
}

/* ============================================================================
   BINARY SEARCH TREE
   ============================================================================ */
let bstIdCounter = 1;
const BST_XSTEP = 58;
const BST_YSTEP = 66;

function bstInsertPure(root, value) {
  let newId;
  function helper(node) {
    if (!node) {
      newId = bstIdCounter++;
      return { id: newId, value, left: null, right: null };
    }
    if (value < node.value) return { ...node, left: helper(node.left) };
    if (value > node.value) return { ...node, right: helper(node.right) };
    return node;
  }
  return { tree: helper(root), newId };
}

function bstDeletePure(root, value) {
  let successorValue;
  function del(node, val, isTarget) {
    if (!node) return null;
    if (val < node.value) return { ...node, left: del(node.left, val, isTarget) };
    if (val > node.value) return { ...node, right: del(node.right, val, isTarget) };
    if (!node.left) return node.right;
    if (!node.right) return node.left;
    let succ = node.right;
    while (succ.left) succ = succ.left;
    if (isTarget) successorValue = succ.value;
    return { ...node, value: succ.value, right: del(node.right, succ.value, false) };
  }
  return { tree: del(root, value, true), successorValue };
}

function bstFindNode(root, value) {
  let node = root;
  while (node) {
    if (value === node.value) return node;
    node = value < node.value ? node.left : node.right;
  }
  return null;
}

function bstInorderOrder(root) {
  const order = [];
  (function walk(n) {
    if (!n) return;
    walk(n.left);
    order.push(n);
    walk(n.right);
  })(root);
  return order;
}
function bstPreorderOrder(root) {
  const order = [];
  (function walk(n) {
    if (!n) return;
    order.push(n);
    walk(n.left);
    walk(n.right);
  })(root);
  return order;
}
function bstPostorderOrder(root) {
  const order = [];
  (function walk(n) {
    if (!n) return;
    walk(n.left);
    walk(n.right);
    order.push(n);
  })(root);
  return order;
}

function bstFlatten(root) {
  const nodes = [];
  const edges = [];
  (function walk(n) {
    if (!n) return;
    nodes.push(n);
    if (n.left) edges.push({ from: n.id, to: n.left.id });
    if (n.right) edges.push({ from: n.id, to: n.right.id });
    walk(n.left);
    walk(n.right);
  })(root);
  return { nodes, edges };
}

function bstLayout(root) {
  const positions = new Map();
  let counter = 0;
  let maxDepth = 0;
  (function walk(n, depth) {
    if (!n) return;
    walk(n.left, depth + 1);
    positions.set(n.id, { x: counter * BST_XSTEP + 30, y: depth * BST_YSTEP + 30 });
    maxDepth = Math.max(maxDepth, depth);
    counter += 1;
    walk(n.right, depth + 1);
  })(root, 0);
  return {
    positions,
    width: Math.max(counter * BST_XSTEP + 30, 160),
    height: (maxDepth + 1) * BST_YSTEP + 20,
  };
}

function buildBSTSearchFrames(root, value) {
  const path = [];
  let node = root;
  while (node) {
    if (value === node.value) {
      path.push({ id: node.id, dir: "match" });
      break;
    }
    const dir = value < node.value ? "left" : "right";
    path.push({ id: node.id, dir, nodeValue: node.value });
    node = dir === "left" ? node.left : node.right;
  }
  const frames = path.map((p) => {
    const isMatch = p.dir === "match";
    return {
      root,
      marks: { [p.id]: isMatch ? "hit" : "active" },
      desc: isMatch ? `${value} matches this node \u2014 found!` : `${value} ${p.dir === "left" ? "<" : ">"} ${p.nodeValue} \u2014 go ${p.dir}.`,
    };
  });
  const found = path.length > 0 && path[path.length - 1].dir === "match";
  if (!found) frames.push({ root, marks: {}, desc: `Reached a null pointer \u2014 ${value} is not in the tree.` });
  return { frames, found };
}

function buildBSTInsertFrames(root, value) {
  const path = [];
  let node = root;
  while (node) {
    if (value === node.value) {
      path.push({ id: node.id, dir: "dup", nodeValue: node.value });
      break;
    }
    const dir = value < node.value ? "left" : "right";
    path.push({ id: node.id, dir, nodeValue: node.value });
    node = dir === "left" ? node.left : node.right;
  }
  const frames = path.map((p) => ({
    root,
    marks: { [p.id]: p.dir === "dup" ? "miss" : "active" },
    desc: p.dir === "dup" ? `${value} already exists \u2014 this BST does not store duplicates.` : `${value} ${p.dir === "left" ? "<" : ">"} ${p.nodeValue} \u2014 go ${p.dir}.`,
  }));
  const isDup = path.length > 0 && path[path.length - 1].dir === "dup";
  if (isDup) return { frames, newRoot: root, inserted: false };
  const { tree: newRoot, newId } = bstInsertPure(root, value);
  frames.push({ root: newRoot, marks: { [newId]: "hit" }, desc: `Found an empty spot \u2014 create a new leaf holding ${value}.` });
  return { frames, newRoot, inserted: true };
}

function buildBSTDeleteFrames(root, value) {
  const search = buildBSTSearchFrames(root, value);
  if (!search.found) return { frames: search.frames, newRoot: root, deleted: false };
  const targetNode = bstFindNode(root, value);
  const childCount = (targetNode.left ? 1 : 0) + (targetNode.right ? 1 : 0);
  const { tree: newRoot, successorValue } = bstDeletePure(root, value);
  const frames = [...search.frames];
  if (successorValue !== undefined) {
    frames.push({
      root,
      marks: {},
      desc: `Node ${value} has two children \u2014 copy in the in-order successor's value (${successorValue}), then delete the successor node from the right subtree.`,
    });
  } else if (childCount === 1) {
    frames.push({ root, marks: {}, desc: `Node ${value} has one child \u2014 link its parent directly to that child.` });
  } else {
    frames.push({ root, marks: {}, desc: `Node ${value} is a leaf \u2014 simply remove it.` });
  }
  frames.push({ root: newRoot, marks: {}, desc: `Deletion complete \u2014 ${value} removed.` });
  return { frames, newRoot, deleted: true };
}

function buildBSTTraversalFrames(root, kind) {
  const nodes = kind === "inorder" ? bstInorderOrder(root) : kind === "preorder" ? bstPreorderOrder(root) : bstPostorderOrder(root);
  const frames = [];
  const visited = [];
  nodes.forEach((n) => {
    visited.push(n.id);
    const marks = {};
    visited.forEach((id, idx) => {
      marks[id] = idx === visited.length - 1 ? "hit" : "active";
    });
    frames.push({ root, marks, desc: `Visit ${n.value}.`, visitValue: n.value });
  });
  return { frames, nodes };
}

function TreeCanvas({ root, marks }) {
  const { positions, width, height } = useMemo(() => bstLayout(root), [root]);
  const { nodes, edges } = useMemo(() => bstFlatten(root), [root]);
  if (!root) return null;
  return (
    <svg width={width} height={height}>
      {edges.map((e, i) => {
        const pa = positions.get(e.from);
        const pb = positions.get(e.to);
        if (!pa || !pb) return null;
        return <line key={i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={LINE} strokeWidth={1.5} />;
      })}
      {nodes.map((n) => {
        const p = positions.get(n.id);
        if (!p) return null;
        const kind = marks && marks[n.id];
        const color = markColor(kind);
        return (
          <g key={n.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={NODE_R}
              fill={kind === "hit" ? color : kind ? ACCENT_SOFT : PANEL_RAISED}
              stroke={kind ? color : ACCENT_DIM}
              strokeWidth={kind ? 2.5 : 1.5}
              style={{ transition: "all 0.2s" }}
            />
            <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={12} fontWeight={kind ? 700 : 500} fill={kind === "hit" ? "#1a1408" : TEXT}>
              {n.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function BSTModule() {
  const [root, setRoot] = useState(null);
  const [view, setView] = useState({ root: null, marks: {} });
  const [insertVal, setInsertVal] = useState("");
  const [deleteVal, setDeleteVal] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [status, setStatus] = useState("A binary search tree keeps every left descendant smaller, every right descendant larger \u2014 giving O(log n) search on a balanced tree.");
  const [resultKind, setResultKind] = useState(null);
  const [operationInfo, setOperationInfo] = useState(null);
  const [stepLog, setStepLog] = useState([]);
  const [sequenceKeys, setSequenceKeys] = useState([]);
  const player = usePlayer();

  useEffect(() => {
    if (!player.playing) setView({ root, marks: {} });
  }, [root]); // eslint-disable-line

  const runOp = (frames, info, onDone, trackSeq) => {
    setOperationInfo(info);
    setStepLog([]);
    setResultKind(null);
    if (trackSeq) setSequenceKeys([]);
    player.run(frames, (frame) => {
      setView(frame);
      setStepLog((prev) => [...prev, frame.desc]);
      if (trackSeq && frame.visitValue !== undefined) setSequenceKeys((prev) => [...prev, frame.visitValue]);
    }, onDone);
  };

  const handleInsert = () => {
    const v = Number(insertVal);
    if (insertVal === "" || Number.isNaN(v)) return setStatus("Enter a numeric value to insert.");
    setSequenceKeys([]);
    const { frames, newRoot, inserted } = buildBSTInsertFrames(root, v);
    runOp(frames, { title: `Insert ${v}`, description: "Walk down comparing values \u2014 smaller goes left, larger goes right \u2014 until an empty spot is found." }, () => {
      setRoot(newRoot);
      setStatus(inserted ? `Inserted ${v}.` : `${v} already exists in the tree.`);
      setResultKind(inserted ? "hit" : "miss");
    });
    setInsertVal("");
  };

  const handleDelete = () => {
    const v = Number(deleteVal);
    if (deleteVal === "" || Number.isNaN(v)) return setStatus("Enter a numeric value to delete.");
    setSequenceKeys([]);
    const { frames, newRoot, deleted } = buildBSTDeleteFrames(root, v);
    runOp(frames, { title: `Delete ${v}`, description: "Find the node, then handle one of three cases: leaf, one child, or two children (replace with the in-order successor)." }, () => {
      setRoot(newRoot);
      setStatus(deleted ? `Deleted ${v}.` : `${v} is not in the tree.`);
      setResultKind(deleted ? "miss" : "miss");
    });
    setDeleteVal("");
  };

  const handleSearch = () => {
    const v = Number(searchVal);
    if (searchVal === "" || Number.isNaN(v)) return setStatus("Enter a value to search for.");
    setSequenceKeys([]);
    const { frames, found } = buildBSTSearchFrames(root, v);
    runOp(frames, { title: `Search for ${v}`, description: "At each node, go left if smaller, right if larger \u2014 O(log n) on a balanced tree, O(n) on a skewed one." }, () => {
      setStatus(found ? `Found ${v}.` : `${v} is not in the tree.`);
      setResultKind(found ? "hit" : "miss");
    });
  };

  const handleTraversal = (kind, label) => {
    if (!root) return setStatus("Tree is empty.");
    const { frames } = buildBSTTraversalFrames(root, kind);
    runOp(frames, { title: label, description: TRAVERSAL_DESCRIPTIONS[kind] }, () => {
      setStatus(`${label} complete.`);
      setResultKind("hit");
    }, true);
  };

  const handleRandom = () => {
    player.stop();
    const n = randInt(6, 9);
    const values = new Set();
    while (values.size < n) values.add(randInt(1, 99));
    let tree = null;
    values.forEach((v) => {
      tree = bstInsertPure(tree, v).tree;
    });
    setRoot(tree);
    setView({ root: tree, marks: {} });
    setOperationInfo(null);
    setStepLog([]);
    setResultKind(null);
    setSequenceKeys([]);
    setStatus("Generated a random BST.");
  };

  const handleClear = () => {
    player.stop();
    setRoot(null);
    setView({ root: null, marks: {} });
    setOperationInfo(null);
    setStepLog([]);
    setResultKind(null);
    setSequenceKeys([]);
    setStatus("Cleared. Insert a value to begin.");
  };

  return (
    <div>
      <ModuleHeader
        eyebrow="Binary Search Tree"
        title="Ordered, branching structure"
        subtitle="Left subtree < node < right subtree, recursively. Search, insert, and delete are all O(log n) on a balanced tree, O(n) on a skewed one."
      />

      <Section label="Insert">
        <TextInput value={insertVal} onChange={setInsertVal} placeholder="value" width={80} type="number" />
        <Button onClick={handleInsert} label="Insert" primary />
      </Section>
      <Section label="Delete">
        <TextInput value={deleteVal} onChange={setDeleteVal} placeholder="value" width={80} type="number" />
        <Button onClick={handleDelete} label="Delete" ghost disabled={!root} />
      </Section>
      <Section label="Search">
        <TextInput value={searchVal} onChange={setSearchVal} placeholder="value" width={80} type="number" />
        <Button onClick={handleSearch} label="Search" disabled={!root} />
      </Section>
      <Section label="Traversals">
        <Button onClick={() => handleTraversal("inorder", "In-order traversal")} label="In-order" disabled={!root} small />
        <Button onClick={() => handleTraversal("preorder", "Pre-order traversal")} label="Pre-order" disabled={!root} small />
        <Button onClick={() => handleTraversal("postorder", "Post-order traversal")} label="Post-order" disabled={!root} small />
        <div style={{ flex: 1 }} />
        <Button onClick={handleRandom} label="Random tree" ghost small />
        <Button onClick={handleClear} label="Clear" ghost small />
      </Section>

      <InfoBox info={operationInfo} />
      <StatusBar status={status} kind={resultKind} />
      <StepLog lines={stepLog} />
      <Chips label="Visit order:" items={sequenceKeys} />

      <Canvas empty={!view.root ? "(empty tree)" : null}>
        <TreeCanvas root={view.root} marks={view.marks} />
      </Canvas>

      <Legend
        items={[
          { color: VISITING, label: "comparing / visited" },
          { color: HIT, label: "found / inserted / current" },
          { color: MISS, label: "deleted / duplicate / not found" },
        ]}
      />
    </div>
  );
}

const TRAVERSAL_DESCRIPTIONS = {
  inorder: "Left subtree, then this node, then right subtree \u2014 visits values in ascending order for a BST.",
  preorder: "This node first, then left subtree, then right subtree \u2014 useful for copying a tree's structure.",
  postorder: "Left subtree, then right subtree, then this node \u2014 useful for safely deleting a tree bottom-up.",
};

/* ============================================================================
   HEAP (min-heap, array-backed complete binary tree)
   ============================================================================ */
const HEAP_MAX = 12;

function heapLayout(n) {
  const positions = [];
  if (n === 0) return { positions, width: 160, height: 100 };
  let maxLevel = 0;
  for (let i = 0; i < n; i++) maxLevel = Math.max(maxLevel, Math.floor(Math.log2(i + 1)));
  const levelWidth = Math.pow(2, maxLevel) * 40 + 40;
  for (let i = 0; i < n; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const firstInLevel = Math.pow(2, level) - 1;
    const posInLevel = i - firstInLevel;
    const slots = Math.pow(2, level);
    const x = ((posInLevel + 0.5) / slots) * levelWidth;
    const y = level * 60 + 30;
    positions.push({ x, y });
  }
  return { positions, width: levelWidth, height: (maxLevel + 1) * 60 + 20 };
}

function buildHeapInsertFrames(heap, value) {
  const frames = [];
  const arr = [...heap, value];
  let i = arr.length - 1;
  frames.push({ heap: [...arr], marks: { [i]: "hit" }, desc: `Place ${value} at the next open slot (index ${i}), keeping the tree complete.` });
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    if (arr[parent] > arr[i]) {
      frames.push({ heap: [...arr], marks: { [i]: "active", [parent]: "active" }, desc: `Parent (index ${parent}, value ${arr[parent]}) is bigger than ${arr[i]} \u2014 swap to restore the min-heap property.` });
      [arr[i], arr[parent]] = [arr[parent], arr[i]];
      i = parent;
      frames.push({ heap: [...arr], marks: { [i]: "hit" }, desc: `Value now sits at index ${i}. Keep bubbling up.` });
    } else {
      frames.push({ heap: [...arr], marks: { [i]: "hit", [parent]: "active" }, desc: `Parent (index ${parent}, value ${arr[parent]}) is already \u2264 ${arr[i]} \u2014 heap property holds. Stop.` });
      break;
    }
  }
  return { frames, finalHeap: arr };
}

function buildHeapExtractFrames(heap) {
  if (heap.length === 0) return { frames: [], finalHeap: [] };
  const min = heap[0];
  const arr = [...heap];
  const frames = [];
  frames.push({ heap: [...arr], marks: { 0: "miss" }, desc: `The minimum is always at the root (index 0): ${min}.` });
  const last = arr.pop();
  if (arr.length === 0) {
    frames.push({ heap: [], marks: {}, desc: `That was the only element \u2014 the heap is now empty.` });
    return { frames, finalHeap: [], min };
  }
  arr[0] = last;
  frames.push({ heap: [...arr], marks: { 0: "active" }, desc: `Move the last element (${last}) to the root, then sink it down to restore heap order.` });
  let i = 0;
  while (true) {
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    let smallest = i;
    if (l < arr.length && arr[l] < arr[smallest]) smallest = l;
    if (r < arr.length && arr[r] < arr[smallest]) smallest = r;
    if (smallest === i) {
      frames.push({ heap: [...arr], marks: { [i]: "hit" }, desc: `Both children (if any) are \u2265 index ${i} \u2014 heap property holds. Stop.` });
      break;
    }
    frames.push({ heap: [...arr], marks: { [i]: "active", [smallest]: "active" }, desc: `Smaller child is at index ${smallest} (value ${arr[smallest]}) \u2014 swap down.` });
    [arr[i], arr[smallest]] = [arr[smallest], arr[i]];
    i = smallest;
    frames.push({ heap: [...arr], marks: { [i]: "hit" }, desc: `Value now sits at index ${i}. Keep sinking.` });
  }
  return { frames, finalHeap: arr, min };
}

function HeapTreeCanvas({ heap, marks }) {
  const { positions, width, height } = useMemo(() => heapLayout(heap.length), [heap.length]);
  if (heap.length === 0) return null;
  return (
    <svg width={width} height={height}>
      {heap.map((v, i) => {
        if (i === 0) return null;
        const parent = Math.floor((i - 1) / 2);
        const pa = positions[parent];
        const pb = positions[i];
        return <line key={i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={LINE} strokeWidth={1.5} />;
      })}
      {heap.map((v, i) => {
        const p = positions[i];
        const kind = marks && marks[i];
        const color = markColor(kind);
        return (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={NODE_R}
              fill={kind === "hit" ? color : kind ? ACCENT_SOFT : PANEL_RAISED}
              stroke={kind ? color : ACCENT_DIM}
              strokeWidth={kind ? 2.5 : 1.5}
              style={{ transition: "all 0.2s" }}
            />
            <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={12} fontWeight={kind ? 700 : 500} fill={kind === "hit" ? "#1a1408" : TEXT}>
              {v}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function HeapModule() {
  const [data, setData] = useState([3, 9, 7, 18, 12, 22]);
  const [view, setView] = useState({ heap: [3, 9, 7, 18, 12, 22], marks: {} });
  const [insertVal, setInsertVal] = useState("");
  const [status, setStatus] = useState("A min-heap keeps every parent \u2264 its children, giving O(1) access to the minimum and O(log n) insert / extract.");
  const [resultKind, setResultKind] = useState(null);
  const [operationInfo, setOperationInfo] = useState(null);
  const [stepLog, setStepLog] = useState([]);
  const player = usePlayer();

  useEffect(() => {
    if (!player.playing) setView({ heap: data, marks: {} });
  }, [data]); // eslint-disable-line

  const runOp = (frames, info, onDone) => {
    setOperationInfo(info);
    setStepLog([]);
    setResultKind(null);
    player.run(frames, (frame) => {
      setView(frame);
      setStepLog((prev) => [...prev, frame.desc]);
    }, onDone, 750);
  };

  const handleInsert = () => {
    const v = Number(insertVal);
    if (insertVal === "" || Number.isNaN(v)) return setStatus("Enter a numeric value to insert.");
    if (data.length >= HEAP_MAX) return setStatus(`Heap is full \u2014 max ${HEAP_MAX} for this demo.`);
    const { frames, finalHeap } = buildHeapInsertFrames(data, v);
    runOp(frames, { title: `Insert ${v}`, description: "Add at the next open slot, then \u201cbubble up\u201d \u2014 swap with the parent while it's larger \u2014 until the heap property holds." }, () => {
      setData(finalHeap);
      setStatus(`Inserted ${v}.`);
      setResultKind("hit");
    });
    setInsertVal("");
  };

  const handleExtract = () => {
    if (data.length === 0) return setStatus("Heap is empty \u2014 nothing to extract.");
    const { frames, finalHeap, min } = buildHeapExtractFrames(data);
    runOp(frames, { title: "Extract minimum", description: "Take the root (the min), move the last element to the root, then \u201csink it down\u201d to restore the heap property." }, () => {
      setData(finalHeap);
      setStatus(`Extracted minimum: ${min}.`);
      setResultKind("miss");
    });
  };

  const handleRandom = () => {
    player.stop();
    const n = randInt(6, 9);
    let arr = [];
    for (let k = 0; k < n; k++) arr = buildHeapInsertFrames(arr, randInt(1, 99)).finalHeap;
    setData(arr);
    setView({ heap: arr, marks: {} });
    setOperationInfo(null);
    setStepLog([]);
    setResultKind(null);
    setStatus("Generated a random min-heap.");
  };

  const handleClear = () => {
    player.stop();
    setData([]);
    setView({ heap: [], marks: {} });
    setOperationInfo(null);
    setStepLog([]);
    setResultKind(null);
    setStatus("Cleared. Insert a value to begin.");
  };

  return (
    <div>
      <ModuleHeader
        eyebrow="Heap"
        title="Min-heap \u2014 a complete binary tree, array-backed"
        subtitle="Every parent is \u2264 its children. Stored as a flat array: children of index i live at 2i+1 and 2i+2. Powers priority queues and heapsort."
      />

      <Section label="Insert">
        <TextInput value={insertVal} onChange={setInsertVal} placeholder="value" width={80} type="number" />
        <Button onClick={handleInsert} label="Insert" primary disabled={data.length >= HEAP_MAX} />
      </Section>
      <Section label="">
        <Button onClick={handleExtract} label="Extract min" disabled={data.length === 0} />
        <div style={{ flex: 1 }} />
        <Button onClick={handleRandom} label="Random heap" ghost />
        <Button onClick={handleClear} label="Clear" ghost />
      </Section>

      <InfoBox info={operationInfo} />
      <StatusBar status={status} kind={resultKind} />
      <StepLog lines={stepLog} />

      <Canvas empty={view.heap.length === 0 ? "(empty heap)" : null}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {view.heap.map((v, i) => {
              const kind = view.marks && view.marks[i];
              const color = markColor(kind);
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 10, color: SUBTEXT }}>{i}</div>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 6,
                      border: `2px solid ${kind ? color : LINE}`,
                      background: kind === "hit" ? color : kind ? "#173430" : PANEL_RAISED,
                      color: kind === "hit" ? "#1a1408" : TEXT,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      transition: "all 0.2s",
                    }}
                  >
                    {v}
                  </div>
                </div>
              );
            })}
          </div>
          <HeapTreeCanvas heap={view.heap} marks={view.marks} />
        </div>
      </Canvas>

      <Legend
        items={[
          { color: VISITING, label: "comparing" },
          { color: HIT, label: "settled position" },
          { color: MISS, label: "extracted" },
        ]}
      />
    </div>
  );
}

/* ============================================================================
   HASH TABLE (separate chaining)
   ============================================================================ */
const HASH_SIZE = 7;

function hashOf(key) {
  let sum = 0;
  for (const ch of String(key)) sum += ch.charCodeAt(0);
  return sum % HASH_SIZE;
}

function pureHashInsert(buckets, key, value) {
  const idx = hashOf(key);
  const chain = buckets[idx];
  const existing = chain.findIndex((e) => e.key === key);
  const newBuckets = buckets.map((b, i) => (i === idx ? [...b] : b));
  if (existing >= 0) newBuckets[idx][existing] = { key, value };
  else newBuckets[idx] = [...newBuckets[idx], { key, value }];
  return newBuckets;
}

function cloneBuckets(buckets) {
  return buckets.map((b) => [...b]);
}

function buildHashInsertFrames(buckets, key, value) {
  const idx = hashOf(key);
  const frames = [];
  frames.push({ buckets: cloneBuckets(buckets), activeBucket: idx, entryMarks: {}, desc: `hash("${key}") = sum of char codes mod ${HASH_SIZE} = ${idx}. Go to bucket ${idx}.` });
  const chain = buckets[idx];
  let foundIdx = -1;
  for (let i = 0; i < chain.length; i++) {
    if (chain[i].key === key) {
      foundIdx = i;
      frames.push({ buckets: cloneBuckets(buckets), activeBucket: idx, entryMarks: { [i]: "hit" }, desc: `Entry ${i} already has key "${key}" \u2014 update its value.` });
      break;
    }
    frames.push({ buckets: cloneBuckets(buckets), activeBucket: idx, entryMarks: { [i]: "active" }, desc: `Compare with entry ${i} ("${chain[i].key}") \u2014 not a match, keep walking the chain.` });
  }
  const newBuckets = buckets.map((b, i) => (i === idx ? [...b] : b));
  if (foundIdx >= 0) {
    newBuckets[idx][foundIdx] = { key, value };
  } else {
    const collided = chain.length > 0;
    newBuckets[idx] = [...newBuckets[idx], { key, value }];
    frames.push({
      buckets: cloneBuckets(newBuckets),
      activeBucket: idx,
      entryMarks: { [newBuckets[idx].length - 1]: "hit" },
      desc: collided
        ? `Collision \u2014 bucket ${idx} already has ${chain.length} entr${chain.length === 1 ? "y" : "ies"}. Append this one to the chain.`
        : `Bucket ${idx} was empty \u2014 insert directly.`,
    });
  }
  return { frames, newBuckets };
}

function buildHashSearchFrames(buckets, key) {
  const idx = hashOf(key);
  const frames = [];
  frames.push({ buckets: cloneBuckets(buckets), activeBucket: idx, entryMarks: {}, desc: `hash("${key}") = ${idx}. Go to bucket ${idx}.` });
  const chain = buckets[idx];
  for (let i = 0; i < chain.length; i++) {
    if (chain[i].key === key) {
      frames.push({ buckets: cloneBuckets(buckets), activeBucket: idx, entryMarks: { [i]: "hit" }, desc: `Entry ${i} matches key "${key}" \u2014 found! Value: ${chain[i].value}.` });
      return { frames, found: true, value: chain[i].value };
    }
    frames.push({ buckets: cloneBuckets(buckets), activeBucket: idx, entryMarks: { [i]: "active" }, desc: `Entry ${i} is "${chain[i].key}" \u2014 not a match, keep walking.` });
  }
  frames.push({ buckets: cloneBuckets(buckets), activeBucket: idx, entryMarks: {}, desc: `Reached the end of the chain \u2014 "${key}" is not in the table.` });
  return { frames, found: false };
}

function buildHashDeleteFrames(buckets, key) {
  const idx = hashOf(key);
  const frames = [];
  frames.push({ buckets: cloneBuckets(buckets), activeBucket: idx, entryMarks: {}, desc: `hash("${key}") = ${idx}. Go to bucket ${idx}.` });
  const chain = buckets[idx];
  let foundIdx = -1;
  for (let i = 0; i < chain.length; i++) {
    if (chain[i].key === key) {
      foundIdx = i;
      frames.push({ buckets: cloneBuckets(buckets), activeBucket: idx, entryMarks: { [i]: "miss" }, desc: `Entry ${i} matches "${key}" \u2014 unlink it from the chain.` });
      break;
    }
    frames.push({ buckets: cloneBuckets(buckets), activeBucket: idx, entryMarks: { [i]: "active" }, desc: `Entry ${i} is "${chain[i].key}" \u2014 not a match, keep walking.` });
  }
  if (foundIdx === -1) {
    frames.push({ buckets: cloneBuckets(buckets), activeBucket: idx, entryMarks: {}, desc: `Reached the end of the chain \u2014 "${key}" was not found.` });
    return { frames, newBuckets: buckets, deleted: false };
  }
  const newBuckets = buckets.map((b, i) => (i === idx ? b.filter((_, j) => j !== foundIdx) : b));
  return { frames, newBuckets, deleted: true };
}

function HashTableModule() {
  const [data, setData] = useState(() => {
    let buckets = Array.from({ length: HASH_SIZE }, () => []);
    buckets = pureHashInsert(buckets, "cat", "4");
    buckets = pureHashInsert(buckets, "dog", "3");
    buckets = pureHashInsert(buckets, "ant", "6");
    return buckets;
  });
  const [view, setView] = useState({ buckets: data, activeBucket: -1, entryMarks: {} });
  const [key, setKey] = useState("");
  const [val, setVal] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [status, setStatus] = useState(`A hash table maps keys to a bucket index via a hash function, giving average O(1) insert/search/delete. Collisions are resolved with chaining (${HASH_SIZE} buckets here).`);
  const [resultKind, setResultKind] = useState(null);
  const [operationInfo, setOperationInfo] = useState(null);
  const [stepLog, setStepLog] = useState([]);
  const player = usePlayer();

  useEffect(() => {
    if (!player.playing) setView({ buckets: data, activeBucket: -1, entryMarks: {} });
  }, [data]); // eslint-disable-line

  const runOp = (frames, info, onDone) => {
    setOperationInfo(info);
    setStepLog([]);
    setResultKind(null);
    player.run(frames, (frame) => {
      setView(frame);
      setStepLog((prev) => [...prev, frame.desc]);
    }, onDone, 750);
  };

  const handleInsert = () => {
    if (!key.trim()) return setStatus("Enter a key to insert.");
    const { frames, newBuckets } = buildHashInsertFrames(data, key.trim(), val.trim() || "\u2014");
    runOp(frames, { title: `Insert "${key.trim()}"`, description: "Hash the key to a bucket index, walk the chain for a matching key, then update or append." }, () => {
      setData(newBuckets);
      setStatus(`Inserted "${key.trim()}".`);
      setResultKind("hit");
    });
    setKey("");
    setVal("");
  };

  const handleSearch = () => {
    if (!searchKey.trim()) return setStatus("Enter a key to search for.");
    const { frames, found, value } = buildHashSearchFrames(data, searchKey.trim());
    runOp(frames, { title: `Search "${searchKey.trim()}"`, description: "Hash the key to find its bucket, then scan that bucket's chain \u2014 average O(1) with a good hash function and low load factor." }, () => {
      setStatus(found ? `Found "${searchKey.trim()}" \u2192 ${value}.` : `"${searchKey.trim()}" is not in the table.`);
      setResultKind(found ? "hit" : "miss");
    });
  };

  const handleDelete = () => {
    if (!searchKey.trim()) return setStatus("Enter a key to delete.");
    const { frames, newBuckets, deleted } = buildHashDeleteFrames(data, searchKey.trim());
    runOp(frames, { title: `Delete "${searchKey.trim()}"`, description: "Hash to the bucket, scan the chain for the key, then unlink the matching entry." }, () => {
      setData(newBuckets);
      setStatus(deleted ? `Deleted "${searchKey.trim()}".` : `"${searchKey.trim()}" was not found.`);
      setResultKind(deleted ? "miss" : "miss");
    });
  };

  const handleRandom = () => {
    player.stop();
    const words = ["fox", "owl", "bee", "elk", "cod", "ram", "hen", "yak", "koi", "emu"];
    let buckets = Array.from({ length: HASH_SIZE }, () => []);
    const n = randInt(4, 7);
    const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, n);
    shuffled.forEach((w) => {
      buckets = pureHashInsert(buckets, w, String(randInt(1, 99)));
    });
    setData(buckets);
    setView({ buckets, activeBucket: -1, entryMarks: {} });
    setOperationInfo(null);
    setStepLog([]);
    setResultKind(null);
    setStatus("Generated a random hash table.");
  };

  const handleClear = () => {
    player.stop();
    const buckets = Array.from({ length: HASH_SIZE }, () => []);
    setData(buckets);
    setView({ buckets, activeBucket: -1, entryMarks: {} });
    setOperationInfo(null);
    setStepLog([]);
    setResultKind(null);
    setStatus("Cleared. Insert a key to begin.");
  };

  return (
    <div>
      <ModuleHeader
        eyebrow="Hash Table"
        title="Key \u2192 bucket, via a hash function"
        subtitle={`hash(key) = sum of character codes mod ${HASH_SIZE}. Collisions land in the same bucket and are chained as a small linked list.`}
      />

      <Section label="Insert">
        <TextInput value={key} onChange={setKey} placeholder="key" width={90} />
        <TextInput value={val} onChange={setVal} placeholder="value (optional)" width={130} />
        <Button onClick={handleInsert} label="Insert" primary />
      </Section>
      <Section label="Search / Delete">
        <TextInput value={searchKey} onChange={setSearchKey} placeholder="key" width={90} />
        <Button onClick={handleSearch} label="Search" />
        <Button onClick={handleDelete} label="Delete" ghost />
        <div style={{ flex: 1 }} />
        <Button onClick={handleRandom} label="Random table" ghost />
        <Button onClick={handleClear} label="Clear" ghost />
      </Section>

      <InfoBox info={operationInfo} />
      <StatusBar status={status} kind={resultKind} />
      <StepLog lines={stepLog} />

      <Canvas>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
          {view.buckets.map((chain, bi) => {
            const isActive = view.activeBucket === bi;
            return (
              <div
                key={bi}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: `1px solid ${isActive ? ACCENT : LINE}`,
                  background: isActive ? PANEL_RAISED : "transparent",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ width: 26, fontSize: 12, color: isActive ? ACCENT : SUBTEXT, fontWeight: 700, flexShrink: 0 }}>[{bi}]</div>
                {chain.length === 0 ? (
                  <div style={{ fontSize: 12, color: SUBTEXT }}>empty</div>
                ) : (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    {chain.map((entry, ei) => {
                      const kind = isActive && view.entryMarks && view.entryMarks[ei];
                      const color = markColor(kind);
                      return (
                        <div key={ei} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div
                            style={{
                              padding: "5px 10px",
                              borderRadius: 5,
                              border: `2px solid ${kind ? color : LINE}`,
                              background: kind === "hit" ? color : kind ? "#173430" : PANEL_RAISED,
                              color: kind === "hit" ? "#1a1408" : TEXT,
                              fontSize: 12,
                              fontWeight: 600,
                              transition: "all 0.2s",
                            }}
                          >
                            {entry.key}: {entry.value}
                          </div>
                          {ei < chain.length - 1 && <span style={{ color: SUBTEXT, fontSize: 12 }}>&rarr;</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Canvas>

      <Legend
        items={[
          { color: VISITING, label: "comparing" },
          { color: HIT, label: "found / inserted" },
          { color: MISS, label: "deleted / not found" },
        ]}
      />
    </div>
  );
}

/* ============================================================================
   GRAPH (build \u2014 BFS \u2014 DFS)
   ============================================================================ */
let graphIdCounter = 1;

function labelForIndex(n) {
  let s = "";
  n += 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function buildAdjacency(nodes, edges) {
  const adj = new Map();
  nodes.forEach((n) => adj.set(n.id, []));
  edges.forEach((e) => {
    adj.get(e.a).push({ to: e.b, edgeId: e.id });
    if (!e.directed) adj.get(e.b).push({ to: e.a, edgeId: e.id });
  });
  return adj;
}

function bfsTrace(nodes, edges, startId) {
  const idToLabel = new Map(nodes.map((n) => [n.id, n.label]));
  const adj = buildAdjacency(nodes, edges);
  const visited = new Set([startId]);
  const queue = [startId];
  const order = [];
  const steps = [];
  const edgesPerStep = [];

  while (queue.length) {
    const u = queue.shift();
    order.push(u);
    const discovered = [];
    const newEdges = [];
    for (const { to, edgeId } of adj.get(u) || []) {
      if (!visited.has(to)) {
        visited.add(to);
        queue.push(to);
        discovered.push(idToLabel.get(to));
        newEdges.push(edgeId);
      }
    }
    edgesPerStep.push(newEdges);
    const queueLabels = queue.map((id) => idToLabel.get(id));
    let text = `Dequeue and visit ${idToLabel.get(u)}.`;
    text += discovered.length ? ` Discover ${discovered.join(", ")} \u2192 enqueue.` : ` No new neighbors.`;
    text += ` Queue: [${queueLabels.join(", ") || "empty"}]`;
    steps.push(text);
  }
  return { order, steps, edgesPerStep, visitedCount: visited.size };
}

function dfsTrace(nodes, edges, startId) {
  const idToLabel = new Map(nodes.map((n) => [n.id, n.label]));
  const adj = buildAdjacency(nodes, edges);
  const visited = new Set();
  const order = [];
  const steps = [];
  const edgesPerStep = [];
  const stack = [{ id: startId, viaEdgeId: null }];

  while (stack.length) {
    const { id: u, viaEdgeId } = stack.pop();
    if (visited.has(u)) continue;
    visited.add(u);
    order.push(u);
    edgesPerStep.push(viaEdgeId !== null ? [viaEdgeId] : []);

    const unvisitedNeighbors = (adj.get(u) || []).filter((n) => !visited.has(n.to));
    for (let i = unvisitedNeighbors.length - 1; i >= 0; i--) {
      const { to, edgeId } = unvisitedNeighbors[i];
      stack.push({ id: to, viaEdgeId: edgeId });
    }

    const stackLabels = stack.map((s) => idToLabel.get(s.id));
    let text = `Visit ${idToLabel.get(u)}.`;
    text += unvisitedNeighbors.length ? ` Push unvisited neighbor(s): ${unvisitedNeighbors.map((n) => idToLabel.get(n.to)).join(", ")}.` : ` No unvisited neighbors \u2192 backtrack.`;
    text += ` Stack: [${stackLabels.join(", ") || "empty"}]`;
    steps.push(text);
  }
  return { order, steps, edgesPerStep, visitedCount: visited.size };
}

function GraphModule() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [directedNext, setDirectedNext] = useState(false);
  const [fromSel, setFromSel] = useState("");
  const [toSel, setToSel] = useState("");
  const [removeNodeSel, setRemoveNodeSel] = useState("");
  const [removeEdgeSel, setRemoveEdgeSel] = useState("");
  const [startSel, setStartSel] = useState("");

  const [highlight, setHighlight] = useState([]);
  const [activeEdgeIds, setActiveEdgeIds] = useState(new Set());
  const [step, setStep] = useState(-1);
  const [status, setStatus] = useState("Add a few nodes and edges to begin.");
  const [mode, setMode] = useState(null);
  const [resultKind, setResultKind] = useState(null);
  const [operationInfo, setOperationInfo] = useState(null);
  const [stepLog, setStepLog] = useState([]);
  const [sequenceKeys, setSequenceKeys] = useState([]);

  const labelCounterRef = useRef(0);
  const timerRef = useRef(null);
  const edgesPerStepRef = useRef([]);

  const stopAnim = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  useEffect(() => stopAnim, [stopAnim]);

  const idToLabel = useMemo(() => new Map(nodes.map((n) => [n.id, n.label])), [nodes]);

  const positions = useMemo(() => {
    const map = new Map();
    const n = nodes.length;
    const size = 320;
    const cx = size / 2;
    const cy = size / 2;
    const r = n <= 1 ? 0 : Math.min(140, 40 + n * 11);
    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / Math.max(n, 1) - Math.PI / 2;
      map.set(node.id, { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
    });
    return map;
  }, [nodes]);

  const addNode = () => {
    const label = labelForIndex(labelCounterRef.current);
    labelCounterRef.current += 1;
    const node = { id: graphIdCounter++, label };
    setNodes((prev) => [...prev, node]);
    setStatus(`Added node ${label}.`);
  };

  const addEdge = () => {
    if (!fromSel || !toSel || fromSel === toSel) return setStatus("Pick two different nodes to connect.");
    const already = edges.some((e) => (e.a === fromSel && e.b === toSel) || (!e.directed && e.a === toSel && e.b === fromSel));
    if (already) return setStatus("That edge already exists.");
    const edge = { id: graphIdCounter++, a: fromSel, b: toSel, directed: directedNext };
    setEdges((prev) => [...prev, edge]);
    setStatus(`Added edge ${idToLabel.get(fromSel)} ${directedNext ? "\u2192" : "\u2014"} ${idToLabel.get(toSel)}.`);
  };

  const removeNode = () => {
    if (!removeNodeSel) return;
    const label = idToLabel.get(removeNodeSel);
    setNodes((prev) => prev.filter((n) => n.id !== removeNodeSel));
    setEdges((prev) => prev.filter((e) => e.a !== removeNodeSel && e.b !== removeNodeSel));
    setRemoveNodeSel("");
    if (startSel === removeNodeSel) setStartSel("");
    setStatus(`Removed node ${label} and its edges.`);
  };

  const removeEdge = () => {
    if (!removeEdgeSel) return;
    setEdges((prev) => prev.filter((e) => e.id !== removeEdgeSel));
    setRemoveEdgeSel("");
    setStatus("Removed edge.");
  };

  const handleRandom = () => {
    stopAnim();
    labelCounterRef.current = 0;
    const count = 7;
    const newNodes = [];
    for (let i = 0; i < count; i++) {
      const label = labelForIndex(labelCounterRef.current);
      labelCounterRef.current += 1;
      newNodes.push({ id: graphIdCounter++, label });
    }
    const newEdges = [];
    for (let i = 1; i < count; i++) {
      const j = Math.floor(Math.random() * i);
      newEdges.push({ id: graphIdCounter++, a: newNodes[j].id, b: newNodes[i].id, directed: false });
    }
    const extra = Math.floor(count / 2);
    for (let k = 0; k < extra; k++) {
      const a = newNodes[Math.floor(Math.random() * count)];
      const b = newNodes[Math.floor(Math.random() * count)];
      if (a.id === b.id) continue;
      const exists = newEdges.some((e) => (e.a === a.id && e.b === b.id) || (e.a === b.id && e.b === a.id));
      if (!exists) newEdges.push({ id: graphIdCounter++, a: a.id, b: b.id, directed: false });
    }
    setNodes(newNodes);
    setEdges(newEdges);
    setFromSel("");
    setToSel("");
    setRemoveNodeSel("");
    setRemoveEdgeSel("");
    setStartSel(newNodes[0].id);
    setHighlight([]);
    setActiveEdgeIds(new Set());
    setStep(-1);
    setResultKind(null);
    setOperationInfo(null);
    setStepLog([]);
    setSequenceKeys([]);
    setStatus("Generated a random connected graph.");
  };

  const handleClear = () => {
    stopAnim();
    labelCounterRef.current = 0;
    setNodes([]);
    setEdges([]);
    setFromSel("");
    setToSel("");
    setRemoveNodeSel("");
    setRemoveEdgeSel("");
    setStartSel("");
    setHighlight([]);
    setActiveEdgeIds(new Set());
    setStep(-1);
    setResultKind(null);
    setOperationInfo(null);
    setStepLog([]);
    setSequenceKeys([]);
    setStatus("Cleared. Add a few nodes and edges to begin.");
  };

  const playTrace = (trace, title, description, onDone) => {
    stopAnim();
    setStep(-1);
    setHighlight(trace.order);
    setActiveEdgeIds(new Set());
    setStepLog([]);
    setSequenceKeys([]);
    setOperationInfo({ title, description });
    edgesPerStepRef.current = trace.edgesPerStep;
    let i = -1;
    timerRef.current = setInterval(() => {
      i += 1;
      setStep(i);
      setStepLog((prev) => [...prev, trace.steps[i]]);
      setSequenceKeys((prev) => [...prev, idToLabel.get(trace.order[i])]);
      setActiveEdgeIds((prev) => {
        const next = new Set(prev);
        (edgesPerStepRef.current[i] || []).forEach((eid) => next.add(eid));
        return next;
      });
      if (i >= trace.order.length - 1) {
        stopAnim();
        onDone && onDone();
      }
    }, ANIM_MS);
  };

  const handleBFS = () => {
    if (!startSel) return setStatus("Pick a start node first.");
    setMode("bfs");
    setResultKind(null);
    const trace = bfsTrace(nodes, edges, startSel);
    playTrace(trace, `Breadth-First Search from ${idToLabel.get(startSel)}`, "Visit the start node, then all of its neighbors, then their neighbors \u2014 level by level, using a queue (FIFO).", () => {
      const unreached = nodes.length - trace.visitedCount;
      setStatus(unreached > 0 ? `BFS complete. Visited ${trace.visitedCount} of ${nodes.length} nodes \u2014 ${unreached} unreachable from ${idToLabel.get(startSel)}.` : `BFS complete. Visited all ${trace.visitedCount} nodes.`);
      setResultKind(unreached > 0 ? "miss" : "hit");
    });
  };

  const handleDFS = () => {
    if (!startSel) return setStatus("Pick a start node first.");
    setMode("dfs");
    setResultKind(null);
    const trace = dfsTrace(nodes, edges, startSel);
    playTrace(trace, `Depth-First Search from ${idToLabel.get(startSel)}`, "Go as deep as possible down one path before backtracking, using a stack (LIFO) \u2014 either explicitly or via recursion.", () => {
      const unreached = nodes.length - trace.visitedCount;
      setStatus(unreached > 0 ? `DFS complete. Visited ${trace.visitedCount} of ${nodes.length} nodes \u2014 ${unreached} unreachable from ${idToLabel.get(startSel)}.` : `DFS complete. Visited all ${trace.visitedCount} nodes.`);
      setResultKind(unreached > 0 ? "miss" : "hit");
    });
  };

  const activeNodeSet = new Set(step >= 0 ? highlight.slice(0, step + 1) : []);
  const currentId = step >= 0 ? highlight[step] : null;

  return (
    <div>
      <ModuleHeader eyebrow="Graph" title="Nodes, edges & traversal" subtitle="Build a graph, then watch breadth-first and depth-first search explore it node by node." />

      <Section label="Nodes">
        <Button onClick={addNode} label="Add node" primary />
        <Select value={removeNodeSel} onChange={setRemoveNodeSel} placeholder="remove\u2026" options={nodes.map((n) => ({ value: n.id, label: n.label }))} />
        <Button onClick={removeNode} label="Remove node" ghost disabled={!removeNodeSel} />
      </Section>

      <Section label="Edges">
        <Select value={fromSel} onChange={setFromSel} placeholder="from" options={nodes.map((n) => ({ value: n.id, label: n.label }))} />
        <Select value={toSel} onChange={setToSel} placeholder="to" options={nodes.map((n) => ({ value: n.id, label: n.label }))} />
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: SUBTEXT, cursor: "pointer" }}>
          <input type="checkbox" checked={directedNext} onChange={(e) => setDirectedNext(e.target.checked)} />
          directed
        </label>
        <Button onClick={addEdge} label="Add edge" primary disabled={nodes.length < 2} />
      </Section>

      <Section label="">
        <Select
          value={removeEdgeSel}
          onChange={setRemoveEdgeSel}
          placeholder="select edge\u2026"
          options={edges.map((e) => ({ value: e.id, label: `${idToLabel.get(e.a)} ${e.directed ? "\u2192" : "\u2014"} ${idToLabel.get(e.b)}` }))}
        />
        <Button onClick={removeEdge} label="Remove edge" ghost disabled={!removeEdgeSel} />
        <div style={{ flex: 1 }} />
        <Button onClick={handleRandom} label="Random graph" ghost />
        <Button onClick={handleClear} label="Clear" ghost />
      </Section>

      <Section label="Traverse from">
        <Select value={startSel} onChange={setStartSel} placeholder="start node\u2026" options={nodes.map((n) => ({ value: n.id, label: n.label }))} />
        <Button onClick={handleBFS} label="BFS" primary disabled={!startSel} />
        <Button onClick={handleDFS} label="DFS" disabled={!startSel} />
      </Section>

      <InfoBox info={operationInfo} />
      <StatusBar status={status} kind={resultKind} />
      <StepLog lines={stepLog} />
      {mode && <Chips label="Visit order:" items={sequenceKeys} />}

      <Canvas empty={nodes.length === 0 ? "(empty graph)" : null}>
        <svg width={320} height={320}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={LINE} />
            </marker>
            <marker id="arrowActive" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={ACCENT} />
            </marker>
          </defs>

          {edges.map((e) => {
            const pa = positions.get(e.a);
            const pb = positions.get(e.b);
            if (!pa || !pb) return null;
            const active = activeEdgeIds.has(e.id);
            const dx = pb.x - pa.x;
            const dy = pb.y - pa.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const ux = dx / dist;
            const uy = dy / dist;
            const x1 = pa.x + ux * NODE_R;
            const y1 = pa.y + uy * NODE_R;
            const x2 = pb.x - ux * (NODE_R + (e.directed ? 6 : 0));
            const y2 = pb.y - uy * (NODE_R + (e.directed ? 6 : 0));
            return (
              <line
                key={e.id}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={active ? ACCENT : LINE}
                strokeWidth={active ? 2.5 : 1.5}
                markerEnd={e.directed ? `url(#${active ? "arrowActive" : "arrow"})` : undefined}
                style={{ transition: "stroke 0.25s" }}
              />
            );
          })}

          {nodes.map((n) => {
            const p = positions.get(n.id);
            if (!p) return null;
            const active = activeNodeSet.has(n.id);
            const isCurrent = n.id === currentId;
            const isLast = step === highlight.length - 1 && highlight.length > 0;
            let fill = PANEL_RAISED;
            let stroke = ACCENT_DIM;
            let textColor = TEXT;
            if (active) {
              fill = ACCENT_SOFT;
              stroke = ACCENT;
            }
            if (isCurrent && isLast && resultKind === "hit") {
              fill = HIT;
              stroke = HIT;
              textColor = "#1a1408";
            }
            if (n.id === startSel && !mode) stroke = ACCENT;
            return (
              <g key={n.id} style={{ transition: "all 0.25s" }}>
                <circle cx={p.x} cy={p.y} r={NODE_R} fill={fill} stroke={stroke} strokeWidth={active ? 2.5 : 1.5} style={{ transition: "all 0.25s" }} />
                <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize={13} fontWeight={active ? 700 : 500} fill={textColor} style={{ userSelect: "none" }}>
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </Canvas>

      <Legend
        items={[
          { color: ACCENT, label: "visited / traversed edge" },
          { color: HIT, label: "finished on" },
          { color: LINE, label: "unvisited" },
        ]}
      />
    </div>
  );
}

/* ============================================================================
   APP SHELL
   ============================================================================ */
const NAV_GROUPS = [
  {
    category: "Linear",
    items: [
      { key: "array", label: "Array", Comp: ArrayModule },
      { key: "stack", label: "Stack", Comp: StackModule },
      { key: "queue", label: "Queue", Comp: QueueModule },
      { key: "linkedlist", label: "Linked List", Comp: LinkedListModule },
    ],
  },
  {
    category: "Trees & Heaps",
    items: [
      { key: "bst", label: "Binary Search Tree", Comp: BSTModule },
      { key: "heap", label: "Heap", Comp: HeapModule },
    ],
  },
  {
    category: "Hashing",
    items: [{ key: "hash", label: "Hash Table", Comp: HashTableModule }],
  },
  {
    category: "Graphs",
    items: [{ key: "graph", label: "Graph (BFS / DFS)", Comp: GraphModule }],
  },
];

function useIsCompact() {
  const [compact, setCompact] = useState(typeof window !== "undefined" ? window.innerWidth < 760 : false);
  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < 760);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return compact;
}

function NavButton({ label, active, onClick, compact }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={
        compact
          ? {
              flexShrink: 0,
              padding: "8px 14px",
              borderRadius: 999,
              border: `1px solid ${active ? ACCENT : LINE}`,
              background: active ? ACCENT_SOFT : "transparent",
              color: active ? ACCENT : SUBTEXT,
              fontFamily: "inherit",
              fontSize: 12.5,
              fontWeight: active ? 700 : 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }
          : {
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "8px 14px",
              borderLeft: `2px solid ${active ? ACCENT : "transparent"}`,
              background: active ? ACCENT_SOFT : hover ? "#101c19" : "transparent",
              color: active ? ACCENT : hover ? TEXT : SUBTEXT,
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: active ? 700 : 500,
              cursor: "pointer",
              transition: "all 0.15s",
            }
      }
    >
      {label}
    </button>
  );
}

export default function DataStructureVisualizer() {
  const [active, setActive] = useState("array");
  const compact = useIsCompact();
  const flatItems = useMemo(() => NAV_GROUPS.flatMap((g) => g.items), []);
  const activeItem = flatItems.find((i) => i.key === active) || flatItems[0];
  const ActiveComp = activeItem.Comp;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: FONT }}>
      <style>{`
        * { box-sizing: border-box; }
        button:focus-visible, select:focus-visible, input:focus-visible {
          outline: 2px solid ${ACCENT};
          outline-offset: 2px;
        }
        ::-webkit-scrollbar { height: 8px; width: 8px; }
        ::-webkit-scrollbar-thumb { background: ${LINE}; border-radius: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <div
        style={{
          padding: compact ? "18px 16px 14px" : "22px 24px 18px",
          borderBottom: `1px solid ${LINE}`,
        }}
      >
        <div style={{ fontSize: 11, letterSpacing: 3, color: ACCENT, textTransform: "uppercase", marginBottom: 4 }}>
          Data Structures, Visualized
        </div>
        <div style={{ fontSize: compact ? 18 : 20, fontWeight: 700 }}>
          Build it. Run an operation. Watch every step.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: compact ? "column" : "row", alignItems: "flex-start" }}>
        {compact ? (
          <div
            style={{
              width: "100%",
              display: "flex",
              gap: 8,
              overflowX: "auto",
              padding: "12px 16px",
              borderBottom: `1px solid ${LINE}`,
            }}
          >
            {flatItems.map((it) => (
              <NavButton key={it.key} label={it.label} active={it.key === active} onClick={() => setActive(it.key)} compact />
            ))}
          </div>
        ) : (
          <nav style={{ width: 220, flexShrink: 0, padding: "20px 0", borderRight: `1px solid ${LINE}`, position: "sticky", top: 0 }}>
            {NAV_GROUPS.map((g) => (
              <div key={g.category} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 10.5, letterSpacing: 1.5, color: SUBTEXT, marginBottom: 4, padding: "0 14px" }}>
                  {g.category.toUpperCase()}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {g.items.map((it) => (
                    <NavButton key={it.key} label={it.label} active={it.key === active} onClick={() => setActive(it.key)} />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        )}

        <main style={{ flex: 1, minWidth: 0, width: "100%", padding: compact ? "20px 16px 48px" : "26px 28px 60px" }}>
          <div style={{ maxWidth: 760 }}>
            <ActiveComp key={active} />
          </div>
        </main>
      </div>
    </div>
  );
}

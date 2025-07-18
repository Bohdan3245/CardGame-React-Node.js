import React, { useState } from "react";

export const ManyToOneMove = () => {
  const [items, setItems] = useState([
    { id: "A", canMove: true },
    { id: "B", canMove: false },
    { id: "C", canMove: true },
    { id: "D", canMove: false },
  ]);

  const [selectedId, setSelectedId] = useState(null);
  const [dropZoneItems, setDropZoneItems] = useState([]);

  const handleSelect = (item) => {
    if (item.canMove) {
      setSelectedId(item.id); // дозволено — вибираємо
    } else {
      alert(`Елемент ${item.id} не можна перенести`);
    }
  };

  const handleDrop = () => {
    if (selectedId) {
      setDropZoneItems((prev) => [...prev, selectedId]);
      setItems((prev) => prev.filter((item) => item.id !== selectedId));
      setSelectedId(null);
    }
  };

  return (
    <div>
      <h3>Всі елементи</h3>
      <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleSelect(item)}
            style={{
              width: "60px",
              height: "60px",
              backgroundColor:
                selectedId === item.id
                  ? "orange"
                  : item.canMove
                  ? "skyblue"
                  : "lightgray",
              cursor: item.canMove ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            {item.id}
          </div>
        ))}
      </div>

      <h3>Сховище (drop zone)</h3>
      <div
        onClick={handleDrop}
        style={{
          width: "400px",
          height: "150px",
          border: "2px dashed gray",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          padding: "10px",
        }}
      >
        {dropZoneItems.map((id) => (
          <div
            key={id}
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "lightgreen",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            {id}
          </div>
        ))}
      </div>
    </div>
  );
};

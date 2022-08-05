import type { Object3D } from "three";

export const generateTable = (data: Object3D) => {
  console.log("data===", data);
  const table = document.createElement("table");
  table.className = "styled-table";
  if (Object.keys(data).length == 0) {
    return;
  }
  const thead = document.createElement("thead");
  const headtr = document.createElement("tr");
  const headFirst = document.createElement("th");
  const headSecond = document.createElement("th");
  headFirst.textContent = "属性";
  headSecond.textContent = "属性值";
  headtr.appendChild(headFirst);
  headtr.appendChild(headSecond);
  thead.appendChild(headtr);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  for (const [key, value] of Object.entries(data)) {
    if (key != "Properties") {
      const row = document.createElement("tr");
      const cellFirst = document.createElement("td");
      const cellSecond = document.createElement("td");
      cellFirst.textContent = key;
      cellSecond.textContent = value;
      row.appendChild(cellFirst);
      row.appendChild(cellSecond);
      tbody.appendChild(row);
      // table.appendChild(row);
    } else {
      for (const [key, value] of Object.entries(data.Properties)) {
        const row = document.createElement("tr");
        const cellFirst = document.createElement("td");
        const cellSecond = document.createElement("td");
        cellFirst.textContent = key;
        cellSecond.textContent = value;
        row.appendChild(cellFirst);
        row.appendChild(cellSecond);
        tbody.appendChild(row);
        // table.appendChild(row);
      }
    }
  }

  prDiv.innerHTML = "";
  prDiv.style.width = "400px";
  prDiv.style.height = "500px";
  prDiv.appendChild(table);
};

$(document).ready(function() {
  const options = {
    slidesToScroll: 1,
    slidesToShow: 1,
    loop: true,
    infinite: true,
    autoplay: false,
    autoplaySpeed: 3000,
  }
  const carousels = bulmaCarousel.attach('.carousel', options);

})

document.addEventListener('DOMContentLoaded', function() {
  loadTableData();
  window.addEventListener('resize', adjustNameColumnWidth);
});


function loadTableData() {
  fetch('./leaderboard_data.json') 
    .then(response => response.json()) 
    .then(data => {
      populateTable(data); 
      enableTableSorting();
      initializeSorting();
    })
    .catch(error => console.error('Error loading leaderboard data:', error));
}

function getNumberFormat(metrics, key, value) {
  // Parse the value as a float (or default to 0 if invalid)
  const numericValue = parseFloat(value) || 0;

  // Find the metric object for the given key
  const metric = metrics.find(m => m.key === key);
  if (!metric) return value; // If the metric is not found, return the original value

  // Format the value based on whether it's the max or second max
  if (numericValue === metric.max) {
    return `<b>${value}</b>`;
  } else if (numericValue === metric.second) {
    return `<u>${value}</u>`;
  } else {
    return value;
  }
}
function populateTable(data) {
  const tableBody = document.querySelector('#HEV-table tbody');
  tableBody.innerHTML = '';

  // Define the metrics and their keys
  const metrics = [
    { key: "v2c@1", max: null, second: null },
    { key: "v2c@3", max: null, second: null },
    { key: "v2c-cot@1", max: null, second: null },
    { key: "v2c-cot@3", max: null, second: null },
    { key: "v2t2c@1", max: null, second: null },
    { key: "v2t2c@3", max: null, second: null },
    { key: "v2t2c-4o@1", max: null, second: null },
    { key: "v2t2c-4o@3", max: null, second: null }
  ];

  // Calculate the max and second max for each metric
  metrics.forEach(metric => {
    const values = data.map(entry => parseFloat(entry.info[metric.key]) || 0);
    metric.max = Math.max(...values);
    metric.second = Math.max(...values.filter(value => value < metric.max));
  });

  // Populate the table rows
  data.forEach(entry => {
    const model = entry.info;
    const row = document.createElement('tr');
    row.classList.add(model.type);

    // Set the row's inner HTML using template literals
    row.innerHTML = `
      <td>${model.model}</td>
      <td><a href="${model.link}" target="_blank">Link</a></td>
      <td>${getNumberFormat(metrics, "v2c@1", model["v2c@1"])}</td>
      <td>${getNumberFormat(metrics, "v2c@3", model["v2c@3"])}</td>
      <td>${getNumberFormat(metrics, "v2c-cot@1", model["v2c-cot@1"])}</td>
      <td>${getNumberFormat(metrics, "v2c-cot@3", model["v2c-cot@3"])}</td>
      <td>${getNumberFormat(metrics, "v2t2c@1", model["v2t2c@1"])}</td>
      <td>${getNumberFormat(metrics, "v2t2c@3", model["v2t2c@3"])}</td>
      <td>${getNumberFormat(metrics, "v2t2c-4o@1", model["v2t2c-4o@1"])}</td>
      <td>${getNumberFormat(metrics, "v2t2c-4o@3", model["v2t2c-4o@3"])}</td>
    `;

    tableBody.appendChild(row);
  });
}

function enableTableSorting() {
  const headers = document.querySelectorAll('#HEV-table th.sortable');
  
  headers.forEach(header => {
    let ascending = false; // Set initial sort direction as descending
    
    header.addEventListener('click', function() {
      const column = Array.from(header.parentNode.children).indexOf(header);
      const type = header.getAttribute('data-sort'); // Get column type (string, number, date)
      
      // Clear arrows from other headers
      headers.forEach(h => {
        h.classList.remove('sort-asc', 'sort-desc');
      });

      // Toggle arrow and sorting direction
      if (ascending) {
        header.classList.add('sort-asc');
        header.classList.remove('sort-desc');
      } else {
        header.classList.add('sort-desc');
        header.classList.remove('sort-asc');
      }

      // Perform sorting
      sortTableByColumn(column, type, ascending);
      
      ascending = !ascending; // Toggle the sort direction
    });
  });
}

function initializeSorting() {
  sortTableByColumn(7, 'number', false);
}

function sortTableByColumn(columnIndex, type, ascending) {
  columnIndex += 2;
  const table = document.querySelector('#HEV-table tbody');
  const rows = Array.from(table.rows);

  const compare = (a, b) => {
    const aText = a.cells[columnIndex].textContent.trim();
    const bText = b.cells[columnIndex].textContent.trim();
    
    if (type === 'number') {
      return (parseFloat(aText) || 0) - (parseFloat(bText) || 0);
    } else if (type === 'date') {
      return new Date(aText) - new Date(bText);
    } else {
      return aText.localeCompare(bText);
    }
  };

  rows.sort((a, b) => ascending ? compare(a, b) : compare(b, a));

  // Re-add sorted rows to the table
  rows.forEach(row => table.appendChild(row));
}

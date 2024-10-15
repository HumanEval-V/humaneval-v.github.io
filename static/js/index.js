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
      populateTable(data.leaderboardData); 
      enableTableSorting();
      initializeSorting();
    })
    .catch(error => console.error('Error loading leaderboard data:', error));
}

function populateTable(data) {
  const tableBody = document.querySelector('#HEV-table tbody');
  tableBody.innerHTML = '';

  const pass1Values = data.map(entry => parseFloat(entry.info["@1"]) || 0);
  const pass10Values = data.map(entry => parseFloat(entry.info["@10"]) || 0);

  const maxPass1 = Math.max(...pass1Values);
  const secondMaxPass1 = Math.max(...pass1Values.filter(value => value < maxPass1));

  const maxPass10 = Math.max(...pass10Values);
  const secondMaxPass10 = Math.max(...pass10Values.filter(value => value < maxPass10));

  data.forEach(entry => {
    const model = entry.info;
    const row = document.createElement('tr');
    row.classList.add(model.type);

    const pass1Value = parseFloat(model["@1"]) || 0;
    const pass10Value = parseFloat(model["@10"]) || 0;

    let pass1Cell;
    if (pass1Value === maxPass1) {
      pass1Cell = `<b>${model["@1"]}</b>`;
    } else if (pass1Value === secondMaxPass1) {
      pass1Cell = `<u>${model["@1"]}</u>`;
    } else {
      pass1Cell = model["@1"];
    }

    let pass10Cell;
    if (pass10Value === maxPass10) {
      pass10Cell = `<b>${model["@10"]}</b>`;
    } else if (pass10Value === secondMaxPass10) {
      pass10Cell = `<u>${model["@10"]}</u>`;
    } else {
      pass10Cell = model["@10"];
    }

    row.innerHTML = `
      <td>${model.name}</td>                <!-- Model name -->
      <td>${model.design}</td>              <!-- Model structure design -->
      <td><a href="${model.link}" target="_blank">Link</a></td>
      <td>${model.size}</td>                 <!-- Model size -->
      <td>${model.date}</td>                 <!-- Date -->
      <td>${pass1Cell}</td>                  <!-- Pass@1 score with conditional bold or underline -->
      <td>${pass10Cell}</td>                 <!-- Pass@10 score with conditional bold or underline -->
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
  sortTableByColumn(5, 'number', false);
}

function sortTableByColumn(columnIndex, type, ascending) {
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

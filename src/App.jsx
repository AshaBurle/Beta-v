import { useState } from "react";
import Papa from "papaparse";
import { saveAs } from "file-saver";

const App = () => {
  const [csvData, setCsvData] = useState([]);
  const [htmlContent, setHtmlContent] = useState("");


  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setCsvData(result.data);
        generateHtml(result.data);
      },
    });
  };


  const fetchCsvFromBackend = async () => {
    try {
      
      const response = await fetch("http://localhost:5000/api/fetch-csv");
      
      if (!response.ok) {
        throw new Error("Failed to fetch CSV file from backend");
      }

      const data = await response.text(); 
      console.log("Received CSV data from backend:", data);

      
      Papa.parse(data, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          setCsvData(result.data);
          generateHtml(result.data);
        },
      });
    } catch (error) {
      console.error("Error fetching CSV from backend:", error);
    }
  };




  const generateHtml = (data) => {
    const token = "dummyToken"; 

    let html = `
        <html>
        <head>
            <style>
                
                .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                        gap: 20px;
                    }
                    .card {
                        background-color: white;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        border-radius: 8px;
                        padding: 20px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .card img {
                        width: 150px;
                        height: 200px;
                        object-fit: cover;
                        border-radius: 8px;
                    }
                    .pair {
                        display: flex;
                        justify-content: space-between;
                        gap: 10px;
                    }
                    .input {
                        border: 1px solid #ccc;
                        padding: 8px;
                        border-radius: 4px;
                        margin-top: 10px;
                        width: 50%;
                    }
                    .button {
                        background-color: #1E3A8A;
                        color: white;
                        padding: 10px 15px;
                        border-radius: 5px;
                        margin-top: 10px;
                        cursor: pointer;
                    }
                    .save-all-btn, .download-btn {
                        display: inline-block;
                        background-color: #2c5282;
                        color: white;
                        padding: 10px;
                        margin: 10px 5px;
                        text-decoration: none;
                        border-radius: 5px;
                        text-align: center;
                    }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>CSV Data</h2>
                <div>
                    <button class="save-all-btn" onclick="saveAll()">Save All</button>
                    <button class="download-btn" onclick="downloadCsv()">Download CSV</button>
                </div>
                <input type="hidden" id="token" value="${token}" />
                <div class="grid">`;

    data.forEach((row, rowIndex) => {
      html += `
            <div class="card">
                <div class="pair">
                    <div>
                        <img src="${row['Front Url']}" alt="Front of Card ${rowIndex}" />
                        <p>Front</p>
                    </div>
                    <div>
                        <img src="${row['Back Url']}" alt="Back of Card ${rowIndex}" />
                        <p>Back</p>
                    </div>
                </div>`;

      Object.keys(row).forEach((key) => {
        if (key !== "Front Url" && key !== "Back Url") {
          html += `
                <div>
                    <label>${key}:</label>
                    <input type="text" id="input-${rowIndex}-${key}" value="${row[key]}" onchange="updateCard(${rowIndex}, '${key}', this.value)" />
                </div>`;
        }
      });

      html += `<button class="button" onclick="saveCard(${rowIndex})">Save</button></div>`;
    });

    html += `
                </div>
            </div>
            <script>
                let csvData = ${JSON.stringify(data)};

                // Function to update a single card's data
                function updateCard(index, key, value) {
                    csvData[index][key] = value;
                }

                // Function to save a single card's data
                function saveCard(index) {
                    console.log("Saving card", index, csvData[index]);
                    // Implement any further save logic or backend calls here
                    alert("Card " + (index + 1) + " saved!");
                }

                // Save all modified data
                function saveAll() {
                    console.log("Save all functionality triggered", csvData);
                    alert("All cards saved!");
                }

               

                  function downloadCsv() {
                    const csvHeaders = [
                        'Title', 'Sport', 'Purchase Price', 'Purchase Date',
                        'Player', 'Set', 'Year', 'Card Manufacturer', 'Card Number', 'Graded',
                        'Card Condition', 'Professional Grader', 'Grade', 'Certification Number',
                        'Parallel', 'Features'
                    ];

                    let formattedCsvData = csvData.map(row => ({
                        'Title': \`\${row['Year']} \${row['Product']} \${row['Name']} Card\`,
                        'Sport': 'Basketball',
                        'Purchase Price': '',
                        'Purchase Date': '',
                        'Player': row['Name'],
                        'Set': row['Product'],
                        'Year': row['Year'],
                        'Card Manufacturer': row['Product'],
                        'Card Number': row['CardSerializedNumber'],
                        'Graded': 'No',
                        'Card Condition': '',
                        'Professional Grader': '',
                        'Grade': '',
                        'Certification Number': '',
                        'Parallel': row['Parallel'],
                        'Features': row['RookieCard'] === 'Yes' ? 'Rookie Card' : ''
                    }));

                    let csvContent = [
                        csvHeaders.join(','),
                        ...formattedCsvData.map(row => csvHeaders.map(header => row[header] || '').join(','))
                    ].join('\\n');

                    let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    let url = URL.createObjectURL(blob);
                    let link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'ebay_bulk_listing.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
               
            </script>
        </body>
        </html>`;

    setHtmlContent(html);
  };

  
  const downloadHtml = () => {
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    saveAs(blob, "generated_html.html");
  };

  return (
    <div>
      <h1>CSV to HTML Generator</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {csvData.length > 0 && (
        <button onClick={downloadHtml}>Download Generated HTML</button>
      )}

<button onClick={fetchCsvFromBackend}>Fetch CSV from Backend</button>
    </div>
  );
};

export default App;

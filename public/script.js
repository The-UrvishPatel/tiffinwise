// const API_BASE_URL =
//   process.env.APP_ENV === "prod"
//     ? "https://tiffinwise.onrender.com" // Render URL
//     : "http://localhost:5000"; // Local Development

const API_BASE_URL = "https://tiffinwise.onrender.com";

document.getElementById("tiffin-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const tiffinData = {
    date: document.getElementById("date").value,
    tiffers: document.getElementById("tiffers").value.toUpperCase().split(""),
    type: document.getElementById("type").value,
    numberOfTiffins: Number(document.getElementById("numberOfTiffins").value),
    costOfTiffin: Number(document.getElementById("costOfTiffin").value),
    extrasType: document.getElementById("extrasType").value,
    countOfExtras: Number(document.getElementById("countOfExtras").value),
    costOfExtra: Number(document.getElementById("costOfExtra").value),
    extraTiffers: document
      .getElementById("extraTiffers")
      .value.toUpperCase()
      .split(""),
    description: document.getElementById("description").value,
    deliveryCharge: 30,
  };

  await fetch(`${API_BASE_URL}/api/tiffins`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tiffinData),
  });

  document.getElementById("tiffin-form").reset();
  loadHistory();
  initForm();
});

function initForm() {
  const dateInput = document.getElementById("date");
  //   const typeSelect = document.getElementById("type");
  const numberOfTiffinsInput = document.getElementById("numberOfTiffins");
  const countOfExtrasInput = document.getElementById("countOfExtras");

  // Set today's date
  dateInput.value = new Date().toISOString().split("T")[0];

  // Set default values
  //   typeSelect.value = "Dinner";
  numberOfTiffinsInput.value = 0;
  countOfExtrasInput.value = 0;
}

// Set extras cost based on selection
document.getElementById("extrasType").addEventListener("change", function () {
  const extrasType = this.value;
  const costInput = document.getElementById("costOfExtra");

  if (extrasType === "Roti") costInput.value = 12;
  else if (extrasType === "Paratha") costInput.value = 15;
  else if (extrasType === "Bun") costInput.value = 6;
  else costInput.value = "";
});

// OLD ---------------------------------------------------------------------------------------
// async function loadHistory() {
//   const response = await fetch(`${API_BASE_URL}/api/tiffins`);
//   const tiffins = await response.json();

//   let historyHtml =
//     "<table><tr><th>Date</th><th>Participants</th><th>Type</th><th>Number of Tiffins</th><th>Cost per Tiffin</th><th>Extras</th><th>Count of Extras</th><th>Cost per Extra</th><th>Extra Tiffers</th><th>Total Cost</th><th>Description</th><th>Delivery Charge</th></tr>";

//   const groupedData = {};

//   tiffins.forEach((t) => {
//     const key = `${t.date}-${t.type}`;

//     if (!groupedData[key]) {
//       groupedData[key] = {
//         date: t.date,
//         tiffers: new Set(),
//         type: t.type,
//         numberOfTiffins: 0,
//         costOfTiffin: t.costOfTiffin || 0,
//         extrasType: [],
//         countOfExtras: 0,
//         costOfExtra: t.costOfExtra || 0,
//         extraTiffers: new Set(),
//         description: new Set(),
//         totalCost: 0,
//         deliveryCharge: t.deliveryCharge || 30, // Ensure delivery cost appears only once per group
//       };
//     }

//     // Update group values
//     t.tiffers.forEach((p) => groupedData[key].tiffers.add(p));
//     if (t.extrasType) groupedData[key].extrasType.push(t.extrasType);
//     t.extraTiffers.forEach((et) => groupedData[key].extraTiffers.add(et));
//     if (t.description) groupedData[key].description.add(t.description);

//     groupedData[key].numberOfTiffins += t.numberOfTiffins || 0;
//     groupedData[key].countOfExtras += t.countOfExtras || 0;
//     groupedData[key].totalCost +=
//       t.numberOfTiffins * (t.costOfTiffin || 0) +
//       t.countOfExtras * (t.costOfExtra || 0);

//     // Delivery charge is added only once (it's already initialized in the first occurrence)
//   });

//   Object.values(groupedData).forEach((t) => {
//     historyHtml += `<tr>
//             <td>${t.date}</td>
//             <td>${[...t.tiffers].join(", ")}</td>
//             <td>${t.type}</td>
//             <td>${t.numberOfTiffins}</td>
//             <td>₹${t.costOfTiffin}</td>
//             <td>${t.extrasType.join(", ") || "-"}</td>
//             <td>${t.countOfExtras}</td>
//             <td>₹${t.costOfExtra}</td>
//             <td>${[...t.extraTiffers].join(", ") || "-"}</td>
//             <td>₹${t.totalCost + t.deliveryCharge}</td>
//             <td>${[...t.description].join("; ") || "-"}</td>
//             <td>₹${t.deliveryCharge}</td>
//         </tr>`;
//   });

//   historyHtml += "</table>";
//   document.getElementById("history").innerHTML = historyHtml;
// }

// ------------------------------------------------------------------------------------

async function loadHistory() {
  const response = await fetch(`${API_BASE_URL}/api/tiffins`);

  const tiffins = await response.json();

  let overAllTotalCost = 0;
  let individualCost = {};

  let historyHtml =
    "<table><tr><th>Ids</th><th>Date</th><th>Participants</th><th>Type</th><th>Number of Tiffins</th><th>Cost per Tiffin</th><th>totalTiffinCost</th><th>Extras</th><th>Count of Extras</th><th>Cost per Extra</th><th>Extra Tiffers</th><th>totalExtrasCost</th><th>Total</th><th>Description</th><th>Delivery Charge</th><th>Individual cost map</th></tr>";

  const groupedData = {};

  tiffins.forEach((t) => {
    const key = `${t.date}-${t.type}`;

    if (!groupedData[key]) {
      groupedData[key] = [];
      groupedData[key]["entries"] = [];
      groupedData[key]["deliveryCost"] = 0;
      groupedData[key]["allUniqueParticipants"] = new Set();
    }

    groupedData[key].push({
      id: t._id,
      date: t.date,
      tiffers: t.tiffers,
      type: t.type,
      numberOfTiffins: t.numberOfTiffins || 0,
      costOfTiffin: `₹${t.costOfTiffin || 0}`,
      totalTiffinCost: t.numberOfTiffins * (t.costOfTiffin || 0),
      extrasType: t.extrasType || "-",
      countOfExtras: t.countOfExtras || 0,
      costOfExtra: `₹${t.costOfExtra || 0}`,
      extraTiffers: t.extraTiffers.length ? t.extraTiffers : "-",
      totalExtrasCost: t.countOfExtras * (t.costOfExtra || 0),
      totalCost:
        t.numberOfTiffins * (t.costOfTiffin || 0) +
        t.countOfExtras * (t.costOfExtra || 0),
      description: t.description || "-",
      deliveryCharge: t.deliveryCharge || 30,
      tiffinParticipants: new Set([...t.tiffers]),
      extraParticipants: new Set([...t.extraTiffers]),
      allUniqueParticipants: new Set([...t.tiffers, ...t.extraTiffers]),
    });

    groupedData[key].entries.push(t);
    groupedData[key].deliveryCost = t.deliveryCharge;
    t.tiffers.forEach((p) => groupedData[key].allUniqueParticipants.add(p));
    t.extraTiffers.forEach((p) =>
      groupedData[key].allUniqueParticipants.add(p)
    );
  });

  Object.values(groupedData).forEach((group) => {
    overAllTotalCost +=
      group.reduce((sum, entry) => sum + entry.totalCost, 0) +
      group.deliveryCost;

    let individualGroupCost = {};

    group.forEach((entry) => {
      let individualTiffinCost =
        entry.tiffinParticipants.size > 0
          ? parseFloat(
              (entry.totalTiffinCost / entry.tiffinParticipants.size).toFixed(2)
            )
          : 0;

      let individualExtraCost =
        entry.extraParticipants.size > 0
          ? parseFloat(
              (entry.totalExtrasCost / entry.extraParticipants.size).toFixed(2)
            )
          : 0;

      entry.tiffinParticipants.forEach((p) => {
        if (!individualGroupCost[p]) individualGroupCost[p] = 0;

        if (!individualCost[p]) individualCost[p] = 0;

        individualGroupCost[p] += individualTiffinCost;
        individualCost[p] += individualTiffinCost;
      });

      entry.extraParticipants.forEach((p) => {
        if (!individualGroupCost[p]) individualGroupCost[p] = 0;

        if (!individualCost[p]) individualCost[p] = 0;

        individualGroupCost[p] += individualExtraCost;
        individualCost[p] += individualExtraCost;
      });
    });

    let individialDeliveryCost =
      group.allUniqueParticipants.size > 0
        ? parseFloat(
            (group.deliveryCost / group.allUniqueParticipants.size).toFixed(2)
          )
        : 0;

    group.allUniqueParticipants.forEach((p) => {
      if (!individualGroupCost[p]) individualGroupCost[p] = 0;

      if (!individualCost[p]) individualCost[p] = 0;

      individualGroupCost[p] += individialDeliveryCost;
      individualCost[p] += individialDeliveryCost;
    });

    historyHtml += `<tr>
        <td>${group.map((t) => t.id).join("<br><br>")}</td>
      <td>${group.map((t, index) => (index === 0 ? t.date : "")).join("")}</td>
      <td>${group.map((t) => t.tiffers).join("<br><br>")}</td>
      <td>${group.map((t, index) => (index === 0 ? t.type : "")).join("")}</td>
      <td>${group.map((t) => t.numberOfTiffins).join("<br><br>")}</td>
      <td>${group.map((t) => t.costOfTiffin).join("<br><br>")}</td>
      <td>${group.map((t) => t.totalTiffinCost).join("<br><br>")}</td>
      <td>${group.map((t) => t.extrasType).join("<br><br>")}</td>
      <td>${group.map((t) => t.countOfExtras).join("<br><br>")}</td>
      <td>${group.map((t) => t.costOfExtra).join("<br><br>")}</td>
      <td>${group.map((t) => t.extraTiffers).join("<br><br>")}</td>
      <td>${group.map((t) => t.totalExtrasCost).join("<br><br>")}</td>
      <td>${group.map((t) => t.totalCost).join("<br><br>")}</td>
      <td>${group.map((t) => t.description).join("<br><br>")}</td>
      <td>${group
        .map((t, index) => (index === 0 ? t.deliveryCharge : ""))
        .join("")}</td>
    <td>${Object.entries(individualGroupCost)
      .map(([key, value]) => `${key}: ${value}`)
      .join("<br>")}</td>
    </tr>`;
  });

  historyHtml += "</table>";
  document.getElementById("history").innerHTML = historyHtml;

  document.getElementById("totalCost").innerHTML = overAllTotalCost;
  document.getElementById("individualCost").innerHTML = Object.entries(
    individualCost
  )
    .map(([key, value]) => `${key}: ${value}`)
    .join("<br>");
}

document.getElementById("delete-button").addEventListener("click", async () => {
  const deleteId = document.getElementById("delete-id").value;

  if (!deleteId) {
    alert("Please enter a valid _id.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/tiffins/${deleteId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Entry deleted successfully!");
      loadHistory(); // Refresh the table after deletion
      initForm();
    } else {
      alert("Error deleting entry.");
    }
  } catch (error) {
    alert("An error occurred while deleting the entry.");
    console.error(error);
  }

  loadHistory();
  initForm();
});

document.getElementById("delete-button-date").addEventListener("click", async () => {
  const startDate = document.getElementById("date-1").value;
  const endDate = document.getElementById("date-2").value;

  if (!startDate || !endDate) {
    alert("Please enter valid Start and End dates.");
    return;
  }


  try {
    const response = await fetch(`${API_BASE_URL}/api/tiffins`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: startDate.trim(),  // Ensure proper format
        endDate: endDate.trim(),
      }),
    });

    if (response.ok) {
      alert("Entries deleted successfully!");
      loadHistory(); // Refresh the table after deletion
      initForm();
    } else {
      const errorMessage = await response.text();
      alert(`Error deleting entries: ${errorMessage}`);
    }
  } catch (error) {
    alert("An error occurred while deleting the entries.");
    console.error(error);
  }

  loadHistory();
  initForm();
});



// OLD ------------------------------------------------------------------------------------
// async function loadExpense() {
//   const response = await fetch(`${API_BASE_URL}/api/tiffins`);
//   const tiffins = await response.json();

//   const groupedData = {};
//   const individualExpenseMap = {}; // Stores total cost per participant

//   // Grouping by date and type
//   tiffins.forEach((t) => {
//     const key = `${t.date}-${t.type}`;

//     if (!groupedData[key]) {
//       groupedData[key] = {
//         date: t.date,
//         type: t.type,
//         entries: [],
//         tiffinParticipants: new Set(),
//         extraParticipants: new Set(),
//         allUniqueParticipants: new Set(),
//         totalCost: 0,
//         individualCost: {},
//         deliveryCharge: t.deliveryCharge || 30, // Take from any entry
//       };
//     }

//     // Store entry details
//     groupedData[key].entries.push(t);

//     // Track all unique participants (both tiffers and extra tiffers)
//     t.tiffers.forEach((p) => {
//       groupedData[key].allUniqueParticipants.add(p);
//       groupedData[key].tiffinParticipants.add(p);
//     });
//     t.extraTiffers.forEach((p) => {
//       groupedData[key].allUniqueParticipants.add(p);
//       groupedData[key].extraParticipants.add(p);
//     });

//     // Calculate the total cost for the group (excluding delivery for now)
//     const entryTotalCost =
//       t.numberOfTiffins * (t.costOfTiffin || 0) +
//       t.countOfExtras * (t.costOfExtra || 0);

//     groupedData[key].totalCost += entryTotalCost;
//   });

//   // Final Expense Calculation
//   let totalOverallCost = 0; // Sum of all group total costs
//   let expenseHtml =
//     "<table><tr><th>Date</th><th>Participants</th><th>Type</th><th>Number of Tiffins</th><th>Extras</th><th>Total Cost</th><th>Individual Share</th></tr>";

//   Object.values(groupedData).forEach((group) => {
//     const allUniqueParticipants = [...group.allUniqueParticipants]; // Convert Set to Array
//     const deliveryShare = group.deliveryCharge / allUniqueParticipants.length;

//     totalOverallCost += group.totalCost + group.deliveryCharge;

//     // Process each entry within the group
//     group.entries.forEach((t) => {
//       const entryCost =
//         t.numberOfTiffins * (t.costOfTiffin || 0) +
//         t.countOfExtras * (t.costOfExtra || 0);

//       const entryParticipants = new Set([...t.tiffers, ...t.extraTiffers]);
//       const perParticipantCost = entryCost / entryParticipants.size;

//       // Update expense map for each participant
//       entryParticipants.forEach((p) => {
//         if (!individualExpenseMap[p]) individualExpenseMap[p] = 0;
//         individualExpenseMap[p] += perParticipantCost + deliveryShare;
//       });

//       // Add entry row to table
//       expenseHtml += `<tr>
//           <td>${t.date}</td>
//           <td>${[...entryParticipants].join(", ")}</td>
//           <td>${t.type}</td>
//           <td>${t.numberOfTiffins}</td>
//           <td>${t.extrasType || "-"}</td>
//           <td>₹${entryCost}</td>
//           <td>₹${(perParticipantCost + deliveryShare).toFixed(2)}</td>
//         </tr>`;
//     });
//   });

//   expenseHtml += "</table>";

//   // Generate summary line at the top
//   let summaryHtml = "<h3>";
//   Object.keys(individualExpenseMap).forEach(
//     (p) => (summaryHtml += `${p} = ₹${individualExpenseMap[p].toFixed(2)}/-, `)
//   );
//   summaryHtml += `Total Cost = ₹${totalOverallCost.toFixed(2)}/-</h3>`;

//   // Insert into DOM
//   document.getElementById("expense").innerHTML = summaryHtml + expenseHtml;
// }
// OLD ------------------------------------------------------------------------------------

// OLD ------------------------------------------------------------------------------------
// document.getElementById("delete-all").addEventListener("click", async () => {
//   if (!confirm("Are you sure you want to delete all entries?")) return;

//   const response = await fetch(`${API_BASE_URL}/api/tiffins/all`, {
//     method: "DELETE",
//   });

//   if (response.ok) {
//     alert("All tiffin entries deleted successfully.");
//     loadHistory();
//     initForm();
//   } else {
//     alert("Failed to delete all entries.");
//   }
// });

// let currentTab = "history"; // Default tab

// function toggleTab() {
//   if (currentTab === "history") {
//     showTab("expense");
//     document.getElementById("showtab").innerText = "Show History";
//     currentTab = "expense";
//   } else {
//     showTab("history");
//     document.getElementById("showtab").innerText = "Show Expense";
//     currentTab = "history";
//   }
// }

// function showTab(tab) {
//   document.getElementById("history").style.display =
//     tab === "history" ? "block" : "none";
//   document.getElementById("expense").style.display =
//     tab === "expense" ? "block" : "none";
// }

// // Initialize with "History" tab shown
// showTab("history");
// document.getElementById("showtab").innerText = "Show Expense";

// OLD ------------------------------------------------------------------------------------

loadHistory();
initForm();

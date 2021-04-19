let db;
let newbudgetDB;
const request = indexedDB.open("budgetDB", newbudgetDB || 21);

request.onupgradeneeded = function (e) {
  console.log("Upgrade is needed for the IndexDB");

  const { oldVersion } = e;
  const newVersion = e.newVersion || db.version;

  console.log(`DB is now updated from version ${oldVersion} to ${newVersion}`);

  db = e.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore("budgetStore", { autoIncrement: true });
  }
};

request.onerror = function (e) {
  console.log(`WRONG! ${e.target.errorCode}`);
};

function checkDatabase() {
  console.log("check that db invoked");

  let transaction = db.transaction(["budgetStore"], "readWrite");

  const store = transaction.objectStore("budgetStore");

  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((res) => {
          if (res.length !== 0) {
            transaction = db.transaction(["budgetStore"], "readWrite");

            const currentStore = transaction.objectStore("budgetStore");

            currentStore.clear();
            console.log("Clearing store 🧹");
          }
        });
    }
  };
}

request.onsuccess = function (e) {
  console.log("success");
  db = e.target.result;

  if (navigator.onLine) {
    console.log("The Backend is online! 🗄️");
    checkDatabase();
  }
};

const saveRecord = (record) => {
  console.log("Save record has been invoked");

  const transaction = db.transaction(["budgetStore"], "readWrite");

  const store = transaction.objectStore("budgetStore");

  store.add(record);
};

window.addEventListener("online", checkDatabase);

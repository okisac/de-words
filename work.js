const submit_word = document.getElementById("submit");

function add_word() {
  const de_word = document.getElementById("de_input").value.trim();
  const tr_word = document.getElementById("tr_input").value.trim();

  if (de_word.length > 20) {
    alert("Bitte geben Sie kürzere Wörter ein (max. 20 Zeichen für Deutsch).");
    return;
  }

  if (tr_word.length > 40) {
    alert("Bitte geben Sie kürzere Wörter ein (max. 40 Zeichen für Türkisch).");
    return;
  }

  // Input kontrolü
  if (!de_word || !tr_word) {
    alert("Bitte geben Sie beide Wörter ein.");
    return;
  }

  fetch("http://localhost:3000/addWord", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ de: de_word, tr: tr_word }),
  })
    .then((res) => res.json())
    .then(() => {
      document.getElementById("de_input").value = "";
      document.getElementById("tr_input").value = "";
      show_last_words(); // Listeyi güncelle
    })
    .catch((err) => console.error("Hata:", err));
}

function checkFontSizes() {
  const tickets = document.querySelectorAll(".ticket");
  const charLimit = 20;
  const screenWidth = window.innerWidth;
  const arka_yuz = document.getElementById("arka_yuz");

  tickets.forEach((ticket) => {
    const text = ticket.textContent.trim();
    console.log("Text content:", text);

    if (text.length > charLimit) {
      arka_yuz.style.transform = "scale(0.6)";
      // const scaleFactor = Math.max(0.6, 1 - (text.length - charLimit) * 0.02);
      // arka_yuz.style.transform = `scale(${scaleFactor})`;
      console.log(text);
      if (screenWidth > 480 && screenWidth <= 768) {
        ticket.style.fontSize = "30px";
      } else if (screenWidth <= 480) {
        ticket.style.fontSize = "24px";
      }
    }
  });
}

function show_last_words() {
  fetch("http://localhost:3000/lastWords")
    .then((res) => res.json())
    .then((last_five) => {
      const listSection = document.getElementById("last_words");
      const divs = listSection.getElementsByClassName("word_paare");

      for (let i = 0; i < divs.length; i++) {
        const de1 = divs[i].getElementsByClassName("de1")[0];
        const tr1 = divs[i].getElementsByClassName("tr1")[0];
        if (i < last_five.length) {
          de1.textContent = last_five[i].de;
          tr1.textContent = last_five[i].tr;
        } else {
          de1.textContent = "";
          tr1.textContent = "";
        }
      }
    })
    .catch((err) => console.error("Hata:", err));
}

function showRandomWord() {
  fetch("http://localhost:3000/allWords")
    .then((res) => res.json())
    .then((allWords) => {
      if (allWords.length === 0) return;

      // Random kelime seç
      const word = allWords[Math.floor(Math.random() * allWords.length)];

      const t_de = document.getElementById("t_de");
      const t_tr = document.getElementById("t_tr");
      const arka_yuz = document.getElementById("arka_yuz");

      t_de.textContent = word.de;

      setTimeout(() => {
        t_de.textContent = "";
      }, 5000);

      setTimeout(() => {
        // 1 saniyelik dönüş: arka yüzü yaz ve göster
        arka_yuz.textContent = word.tr;
        t_tr.style.transform = "rotateY(180deg)";
      }, 2000);

      setTimeout(() => {
        t_tr.style.transform = "rotateY(0deg)";
      }, 5000);

      setTimeout(() => {
        arka_yuz.textContent = "";
      }, 5500);
    })
    .catch((err) => console.error("Hata showRandomWord:", err));
}

window.addEventListener("DOMContentLoaded", () => {
  show_last_words(); // Sayfa açılır açılmaz son 5 kelimeyi getir
  showRandomWord();
  startRandomWordLoop();
});

function startRandomWordLoop() {
  setInterval(() => {
    showRandomWord();
  }, 6000); // 6 saniyede bir yeni kelime seçiliyor (animasyon toplam süresi ~5.8s)
}

// document.getElementById("t_tr").addEventListener("click", showRandomWord);
submit_word.addEventListener("click", add_word);
["de_input", "tr_input"].forEach((id) => {
  document.getElementById(id).addEventListener("keydown", (e) => {
    if (e.key === "Enter") add_word();
  });
});

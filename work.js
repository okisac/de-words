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

  fetch("/addWord", {
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
  fetch("/lastWords")
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
  fetch("/allWords")
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

  // Panel/button pairs to manage
  const aboutBtn = document.getElementById("about-btn");
  const aboutPanel = document.getElementById("about-panel");
  const builtBtn = document.getElementById("built-with-btn");
  const builtPanel = document.getElementById("built-with-panel");

  const pairs = [
    { btn: aboutBtn, panel: aboutPanel },
    { btn: builtBtn, panel: builtPanel },
  ];

  let _outsideClickHandler = null;

  function anyPanelVisible() {
    return pairs.some((p) => p.panel && p.panel.classList.contains("visible"));
  }

  function openPanel(btn, panel) {
    if (!btn || !panel) return;
    // Close other panels first
    pairs.forEach((p) => {
      if (p.panel && p.panel !== panel) closePanel(p.btn, p.panel);
    });

    panel.classList.add("visible");
    btn.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");

    // Position centered under the button
    const btnRect = btn.getBoundingClientRect();
    const panelWidth = panel.offsetWidth || 320;
    let left = Math.round(btnRect.left + btnRect.width / 2 - panelWidth / 2);
    const minLeft = 8;
    const maxLeft = window.innerWidth - panelWidth - 8;
    if (left < minLeft) left = minLeft;
    if (left > maxLeft) left = maxLeft;
    const top = Math.round(btnRect.bottom + 8);
    panel.style.left = left + "px";
    panel.style.top = top + "px";

    // Add outside click handler if not present
    if (!_outsideClickHandler) {
      _outsideClickHandler = (e) => {
        // if click is outside all visible panels and their buttons, close all
        const clickedInsideAny = pairs.some((p) => {
          return (
            (p.panel && p.panel.classList.contains("visible") && p.panel.contains(e.target)) ||
            (p.btn && p.btn.contains(e.target))
          );
        });
        if (!clickedInsideAny) {
          pairs.forEach((p) => {
            if (p.panel && p.panel.classList.contains("visible")) closePanel(p.btn, p.panel);
          });
        }
      };
      document.addEventListener("click", _outsideClickHandler);
    }
    // Add Esc key handling to close panels
    if (!document._panelEscHandler) {
      document._panelEscHandler = (ev) => {
        if (ev.key === "Escape") {
          pairs.forEach((p) => {
            if (p.panel && p.panel.classList.contains("visible")) closePanel(p.btn, p.panel);
          });
        }
      };
      document.addEventListener("keydown", document._panelEscHandler);
    }
  }

  function closePanel(btn, panel) {
    if (!btn || !panel) return;
    panel.classList.remove("visible");
    btn.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
    // remove handler if no panels visible
    if (!anyPanelVisible() && _outsideClickHandler) {
      document.removeEventListener("click", _outsideClickHandler);
      _outsideClickHandler = null;
      // remove Esc handler when no panels visible
      if (document._panelEscHandler) {
        document.removeEventListener("keydown", document._panelEscHandler);
        document._panelEscHandler = null;
      }
    }
  }

  // Attach click listeners to each button
  pairs.forEach((p) => {
    if (!p.btn || !p.panel) return;
    p.btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (p.panel.classList.contains("visible")) {
        closePanel(p.btn, p.panel);
      } else {
        openPanel(p.btn, p.panel);
      }
    });
  });
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

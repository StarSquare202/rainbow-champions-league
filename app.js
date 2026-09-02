const source = window.RCL_DATA ?? {};
const data = Array.isArray(source.sports) ? source.sports : [];
const tabs = document.querySelector("#tabs");
const updatedAt = document.querySelector("#updated-at");
const title = document.querySelector("#ranking-title");
const titleEn = document.querySelector("#ranking-title-en");
const count = document.querySelector("#player-count");
const body = document.querySelector("#ranking-body");
const emptyState = document.querySelector("#empty-state");
const bgm = document.querySelector("#bgm");
const soundToggle = document.querySelector("#sound-toggle");
const page = document.querySelector(".page");
const watermarkTrack = document.querySelector("#watermark-track");

const watermarkText = "무챔스 ★ RCL ★";

function fillWatermark() {
  const rowPitch = 100;
  const rowCount = Math.ceil(page.scrollHeight / rowPitch) + 3;

  if (watermarkTrack.childElementCount === rowCount) return;

  watermarkTrack.replaceChildren(
    ...Array.from({ length: rowCount }, () => {
      const row = document.createElement("div");
      const line = document.createElement("div");
      row.className = "watermark-row";
      line.className = "watermark-line-track";
      line.append(
        ...Array.from({ length: 12 }, () => {
          const unit = document.createElement("span");
          unit.className = "watermark-unit";
          unit.textContent = watermarkText;
          return unit;
        }),
      );
      row.append(line);
      return row;
    }),
  );
}

bgm.volume = 0.5;

function setSoundState(isPlaying) {
  soundToggle.classList.toggle("is-playing", isPlaying);
  soundToggle.setAttribute("aria-pressed", String(isPlaying));
  soundToggle.setAttribute("aria-label", isPlaying ? "배경 음악 음소거" : "배경 음악 재생");
}

soundToggle.addEventListener("click", async () => {
  if (bgm.paused) {
    try {
      await bgm.play();
      setSoundState(true);
    } catch {
      setSoundState(false);
    }
  } else {
    bgm.pause();
    setSoundState(false);
  }
});

if (source.updatedAt) {
  updatedAt.textContent = `마지막 갱신 ${new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(source.updatedAt))}`;
} else {
  updatedAt.hidden = true;
}

function selectSport(index) {
  const sport = data[index];
  if (!sport) return;

  tabs.querySelectorAll(".tab").forEach((tab, tabIndex) => {
    tab.setAttribute("aria-selected", String(tabIndex === index));
    tab.tabIndex = tabIndex === index ? 0 : -1;
  });

  title.textContent = sport.sport;
  titleEn.textContent = sport.sportEn ?? "";
  count.textContent = `${sport.rankings.length}명`;
  body.replaceChildren(
    ...sport.rankings.map((player, playerIndex) => {
      const row = document.createElement("tr");
      const rank = document.createElement("td");
      const name = document.createElement("td");
      const playerInfo = document.createElement("div");
      const nameKo = document.createElement("span");
      const nameEn = document.createElement("span");
      rank.textContent = player.rank;
      playerInfo.className = "player-info";
      nameKo.className = "player-name";
      nameKo.textContent = player.name;
      nameEn.className = "player-name-en";
      nameEn.textContent = player.nameEn ?? "";
      playerInfo.append(nameKo, nameEn);

      if (playerIndex < 3) {
        const medal = document.createElement("span");
        const medalNames = ["gold", "silver", "bronze"];
        const medalName = medalNames[playerIndex];
        row.classList.add("podium-row", `podium-${medalName}`);
        rank.classList.add("podium-rank");
        medal.className = `rank-medal rank-medal-${medalName}`;
        medal.setAttribute("aria-hidden", "true");
        name.classList.add("podium-player");
        name.append(medal, playerInfo);
      } else {
        name.append(playerInfo);
      }
      row.append(rank, name);
      return row;
    }),
  );
  emptyState.hidden = sport.rankings.length !== 0;
  requestAnimationFrame(fillWatermark);
}

data.forEach((sport, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "tab";
  button.role = "tab";
  button.textContent = sport.sport;
  button.setAttribute("aria-selected", "false");
  button.addEventListener("click", () => selectSport(index));
  button.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + data.length) % data.length;
    selectSport(nextIndex);
    tabs.children[nextIndex].focus();
  });
  tabs.append(button);
});

if (data.length) {
  selectSport(0);
} else {
  title.textContent = "종목 랭킹";
  titleEn.textContent = "";
  count.textContent = "0명";
  emptyState.hidden = false;
}

fillWatermark();
window.addEventListener("load", fillWatermark);
window.addEventListener("resize", fillWatermark);

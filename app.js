const source = window.RCL_DATA ?? {};
const data = Array.isArray(source.sports) ? source.sports : [];
const tabs = document.querySelector("#tabs");
const updatedAt = document.querySelector("#updated-at");
const title = document.querySelector("#ranking-title");
const titleEn = document.querySelector("#ranking-title-en");
const count = document.querySelector("#player-count");
const body = document.querySelector("#ranking-body");
const emptyState = document.querySelector("#empty-state");

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
    ...sport.rankings.map((player) => {
      const row = document.createElement("tr");
      const rank = document.createElement("td");
      const name = document.createElement("td");
      const nameKo = document.createElement("span");
      const nameEn = document.createElement("span");
      rank.textContent = player.rank;
      nameKo.className = "player-name";
      nameKo.textContent = player.name;
      nameEn.className = "player-name-en";
      nameEn.textContent = player.nameEn ?? "";
      name.append(nameKo, nameEn);
      row.append(rank, name);
      return row;
    }),
  );
  emptyState.hidden = sport.rankings.length !== 0;
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


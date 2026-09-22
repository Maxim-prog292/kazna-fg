const TOPICS = {
  tax: {
    number: "01",
    title: "Податное дело",
    icon: "icon-tax",
    main:
      "«Ревизские сказки» — это не сказки, а жесткая перепись душ. Крестьянина считали как \"единицу налога\". Без записи в сказке тебя не существовало для государства.",
    today:
      "Ваш ИНН и паспорт делают то же самое. Финансовое правило №1: Учёт — это 90% успеха. Если казна не знает, сколько людей живет в Твери, она не может собрать бюджет на школы и дороги.",
    tver:
      "«В 1782 году в Тверской губернии переписали более 700 тысяч душ. Эти данные помогли замостить главную улицу города — Миллионную (ныне Советскую)».",
  },
  property: {
    number: "02",
    title: "Госсобственность",
    icon: "icon-property",
    main:
      "Леса считались \"золотым фондом\". Их продавали на строительство флота, а мосты через Волгу и Тверцу требовали постоянного ремонта. Казенная палата лично следила, чтобы брёвна не сгнили, а мостовые сборы шли в казну.",
    today:
      "Сейчас этим занимается Росимущество. Но суть та же: у государства есть имущество, которое должно приносить пользу, а не висеть мертвым грузом.",
    tver:
      "«Старый Волжский мост, который вы видите в городе, построен на средства, вырученные с продажи казенного леса именно в те годы».",
  },
  monopoly: {
    number: "03",
    title: "Монополии",
    icon: "icon-monopoly",
    main:
      "Соль и вино были государственным \"брендом\". Купить их у частника было нельзя — только в казенных лавках. Цена была высокой, но народ покупал, потому что без соли жизнь остановится, а вино пили по праздникам.",
    today:
      "Это называется акцизные товары. Когда вы покупаете бутылку воды с газом или пачку сигарет, часть цены — налог государству. Финансовая логика не меняется веками: бери с того, без чего народ не обойдется.",
    tver:
      "«Тверские кабаки (питейные дома) приносили до 40% всех доходов губернии в 1790-х годах».",
  },
  industry: {
    number: "04",
    title: "Промышленность",
    icon: "icon-industry",
    main:
      "Казенная палата не строила фабрики, но строго проверяла частников. Зачем? Чтобы фабрикант платил налоги с каждого станка и не переманивал казенных крестьян. Это был ранний \"корпоративный контроль\".",
    today:
      "Сейчас это 44-ФЗ и камеральные проверки ФНС. Государство не мешает бизнесу, но контролирует, чтобы бюджет не пострадал.",
    tver:
      "«В Твери той эпохи работало 15 крупных мануфактур, включая знаменитый путевой дворец, который строили в том числе на средства от надзора за этими заводами».",
  },
};

const root = document.documentElement;
const sheetLayer = document.querySelector("#sheet-layer");
const sheet = document.querySelector("#detail-sheet");
const sheetIcon = document.querySelector("#sheet-icon");
const sheetNumber = document.querySelector("#sheet-number");
const sheetTitle = document.querySelector("#sheet-title");
const sheetMain = document.querySelector("#sheet-main");
const sheetToday = document.querySelector("#sheet-today");
const sheetTver = document.querySelector("#sheet-tver");
const topicButtons = [...document.querySelectorAll("[data-topic]")];
const closeButtons = [...document.querySelectorAll("[data-close-sheet]")];
const grabber = document.querySelector(".sheet__grabber");

let lastTrigger = null;
let isOpen = false;
let closeTimer = null;
let dragStartY = 0;
let dragDistance = 0;

function scaleStage() {
  const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  root.style.setProperty("--scale", String(scale));
}

function iconMarkup(symbolId, title) {
  return `
    <svg viewBox="0 0 72 72" role="img" aria-label="${title}">
      <use href="#${symbolId}"></use>
    </svg>
  `;
}

function fillSheet(topic) {
  sheetNumber.textContent = topic.number;
  sheetTitle.textContent = topic.title;
  sheetMain.textContent = topic.main;
  sheetToday.textContent = topic.today;
  sheetTver.textContent = topic.tver;
  sheetIcon.innerHTML = iconMarkup(topic.icon, topic.title);
}

function openSheet(key, trigger) {
  const topic = TOPICS[key];
  if (!topic) return;

  window.clearTimeout(closeTimer);
  lastTrigger = trigger;
  fillSheet(topic);
  sheetLayer.hidden = false;
  sheetLayer.className = "sheet-layer is-opening";
  isOpen = true;

  requestAnimationFrame(() => {
    sheetLayer.className = "sheet-layer is-open";
    sheet.focus({ preventScroll: true });
  });
}

function closeSheet() {
  if (!isOpen) return;

  isOpen = false;
  sheet.style.transform = "";
  sheet.style.transition = "";
  sheetLayer.className = "sheet-layer is-closing";

  closeTimer = window.setTimeout(() => {
    sheetLayer.hidden = true;
    sheetLayer.className = "sheet-layer";
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  }, 520);
}

function handleKeydown(event) {
  if (!isOpen) return;

  if (event.key === "Escape") {
    event.preventDefault();
    closeSheet();
    return;
  }

  if (event.key !== "Tab") return;

  const focusable = [...sheet.querySelectorAll("button, [href], [tabindex]:not([tabindex='-1'])")]
    .filter((element) => !element.disabled && element.offsetParent !== null);

  if (!focusable.length) {
    event.preventDefault();
    sheet.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

topicButtons.forEach((button) => {
  button.addEventListener("click", () => openSheet(button.dataset.topic, button));
});

closeButtons.forEach((button) => button.addEventListener("click", closeSheet));

grabber.addEventListener("pointerdown", (event) => {
  if (!isOpen) return;
  dragStartY = event.clientY;
  dragDistance = 0;
  grabber.setPointerCapture(event.pointerId);
  sheet.style.transition = "none";
});

grabber.addEventListener("pointermove", (event) => {
  if (!grabber.hasPointerCapture(event.pointerId)) return;
  dragDistance = Math.max(0, event.clientY - dragStartY);
  sheet.style.transform = `translate(-50%, ${dragDistance}px)`;
});

grabber.addEventListener("pointerup", (event) => {
  if (!grabber.hasPointerCapture(event.pointerId)) return;
  grabber.releasePointerCapture(event.pointerId);

  if (dragDistance > 100) {
    closeSheet();
  } else {
    sheet.style.transition = "transform 360ms cubic-bezier(0.22, 1, 0.36, 1)";
    sheet.style.transform = "translate(-50%, 0)";
  }
});

grabber.addEventListener("pointercancel", () => {
  sheet.style.transition = "transform 360ms cubic-bezier(0.22, 1, 0.36, 1)";
  sheet.style.transform = "translate(-50%, 0)";
});

window.addEventListener("resize", scaleStage, { passive: true });
document.addEventListener("keydown", handleKeydown);
scaleStage();
window.ExhibitUI?.mount({ timeout: 60000, reset: closeSheet });

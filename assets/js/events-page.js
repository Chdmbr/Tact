function initEventsPage() {
  var initialEvents = [];
  if (typeof window.getTactEventFeedSnapshot === "function") {
    initialEvents = window.getTactEventFeedSnapshot();
  } else {
    initialEvents = Array.isArray(window.TACT_EVENT_FEED) ? window.TACT_EVENT_FEED.slice() : [];
  }

  renderEventSections(initialEvents);

  if (typeof window.loadTactEventFeed === "function") {
    scheduleAsync(function () {
      window.loadTactEventFeed({ forceRefresh: true }).then(function (freshEvents) {
        if (!sameEventList(initialEvents, freshEvents)) {
          renderEventSections(freshEvents);
        }
      });
    });
  }

  scheduleAsync(function () {
    if (window.TACT_CHROME) {
      window.TACT_CHROME.renderHeader();
      window.TACT_CHROME.initDropdowns();
    }

    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  });
}

function scheduleAsync(callback) {
  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(function () {
      window.setTimeout(callback, 0);
    });
    return;
  }

  window.setTimeout(callback, 0);
}

if (document.getElementById("upcoming-list") && document.getElementById("archive-list")) {
  initEventsPage();
} else {
  document.addEventListener("DOMContentLoaded", initEventsPage, { once: true });
}

function renderEventSections(events) {
  var buckets = splitEvents(events);
  renderUpcoming(buckets.upcoming);
  scheduleAsync(function () {
    renderArchive(buckets.archive);
  });
}

function splitEvents(events) {
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var upcoming = [];
  var archive = [];

  events.forEach(function (event) {
    var date = parseDate(event.date);
    if (!date) return;

    var status = String(event.status || "scheduled").toLowerCase();
    if (status !== "completed" && date >= today) {
      upcoming.push(event);
    } else {
      archive.push(event);
    }
  });

  upcoming.sort(function (a, b) {
    return parseDate(a.date) - parseDate(b.date);
  });

  archive.sort(function (a, b) {
    return parseDate(b.date) - parseDate(a.date);
  });

  return { upcoming: upcoming, archive: archive };
}

function sameEventList(left, right) {
  return JSON.stringify(left || []) === JSON.stringify(right || []);
}

function parseDate(value) {
  if (!value) return null;
  var date = new Date(value + "T00:00:00");
  return isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  var date = parseDate(value);
  if (!date) return value || "";
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function renderUpcoming(list) {
  var root = document.getElementById("upcoming-list");
  if (!root) return;
  root.innerHTML = "";

  if (!list.length) {
    root.innerHTML = '<p class="empty">No upcoming events right now.</p>';
    return;
  }

  root.appendChild(buildUpcomingCard(list[0], true));

  if (list.length > 1) {
    scheduleAsync(function () {
      list.slice(1).forEach(function (item) {
        root.appendChild(buildUpcomingCard(item, false));
      });
    });
  }
}

function renderArchive(list) {
  var root = document.getElementById("archive-list");
  if (!root) return;
  root.innerHTML = "";

  if (!list.length) {
    root.innerHTML = '<p class="empty">No archived events yet.</p>';
    return;
  }

  list.forEach(function (item) {
    var article = document.createElement("article");
    article.className = "archive-item";
    article.innerHTML =
      '<img src="' +
      escapeHtml(item.poster || item.image || "assets/images/tact-logo.jpg") +
      '" onerror="this.onerror=null;this.src=\'assets/images/tact-logo.jpg\';" alt="' +
      escapeHtml(item.title || "Event image") +
      '" loading="lazy" decoding="async">' +
      '<div class="archive-body">' +
      '<span class="meta">' +
      escapeHtml(formatDate(item.date)) +
      " | " +
      escapeHtml(item.time || "Time TBA") +
      " | " +
      escapeHtml(item.location || "TBA") +
      "</span>" +
      "<h3>" +
      escapeHtml(item.title || "Untitled event") +
      "</h3>" +
      "<p>" +
      escapeHtml(item.teaser || item.homepageMatter || "") +
      "</p>" +
      "</div>";
    root.appendChild(article);
  });
}

function buildUpcomingCard(item, isPriority) {
  var article = document.createElement("article");
  article.className = "event-card" + (isPriority ? " event-card--priority" : "");
  article.innerHTML =
    '<img src="' +
    escapeHtml(item.poster || item.image || "assets/images/tact-logo.jpg") +
    '" onerror="this.onerror=null;this.src=\'assets/images/tact-logo.jpg\';" alt="' +
    escapeHtml(item.title || "Event image") +
    '" loading="' +
    (isPriority ? "eager" : "lazy") +
    '" fetchpriority="' +
    (isPriority ? "high" : "auto") +
    '" decoding="async">' +
    '<div class="event-body">' +
    '<span class="meta">' +
    escapeHtml(formatDate(item.date)) +
    " | " +
    escapeHtml(item.time || "Time TBA") +
    " | " +
    escapeHtml(item.location || "TBA") +
    "</span>" +
    "<h3>" +
    escapeHtml(item.title || "Untitled event") +
    "</h3>" +
    "<p>" +
    escapeHtml(item.teaser || item.homepageMatter || "") +
    "</p>" +
    "</div>";
  return article;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

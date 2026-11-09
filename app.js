"use strict";

const storageKey = "moolyahost-portal-demo-v1";
const plans = {
  2: { cpu: 1, disk: 50 },
  4: { cpu: 2, disk: 100 },
  8: { cpu: 4, disk: 200 },
  16: { cpu: 8, disk: 450 },
};
const $ = (id) => document.getElementById(id);
const provision = $("provision");
const form = $("create-form");
const hostname = form.elements.hostname;
const timeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

function sampleWorkspace() {
  return {
    instances: [
      { name: "web-demo", plan: "4", os: "Ubuntu 24.04", running: true },
      { name: "staging-demo", plan: "2", os: "Debian 12", running: false },
    ],
    activity: [{ message: "Sample workspace loaded", at: new Date().toISOString() }],
  };
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved?.instances) && Array.isArray(saved?.activity)) return saved;
  } catch {
    // The workspace can also run with storage disabled.
  }
  return sampleWorkspace();
}

let workspace = load();

function render() {
  const { instances, activity } = workspace;
  $("total").textContent = instances.length;
  $("running").textContent = instances.filter((server) => server.running).length;
  $("cpu").textContent = instances.reduce((total, server) => total + plans[server.plan].cpu, 0);
  $("empty").hidden = instances.length > 0;
  $("instances").replaceChildren(...instances.map((server) => {
    const row = $("instance-template").content.firstElementChild.cloneNode(true);
    const plan = plans[server.plan];
    row.dataset.name = server.name;
    row.querySelector("h3").textContent = server.name;
    row.querySelector(".server-info p").textContent =
      `NVMe ${server.plan} · ${plan.cpu} vCPU · ${server.plan} GB RAM · ${plan.disk} GB NVMe · ${server.os}`;
    const state = row.querySelector(".state");
    state.dataset.running = server.running;
    state.textContent = server.running ? "Running" : "Stopped";
    const toggle = row.querySelector('[data-action="toggle"]');
    toggle.textContent = server.running ? "Stop" : "Start";
    toggle.setAttribute("aria-label", `${toggle.textContent} ${server.name}`);
    const restart = row.querySelector('[data-action="restart"]');
    restart.disabled = !server.running;
    restart.setAttribute("aria-label", `Restart ${server.name}`);
    return row;
  }));
  $("activity").replaceChildren(...activity.map((event) => {
    const item = document.createElement("li");
    const time = document.createElement("time");
    time.dateTime = event.at;
    time.textContent = timeFormat.format(new Date(event.at));
    item.append(event.message, time);
    return item;
  }));
}

function commit(message) {
  workspace.activity.unshift({ message, at: new Date().toISOString() });
  workspace.activity = workspace.activity.slice(0, 20);
  try {
    localStorage.setItem(storageKey, JSON.stringify(workspace));
  } catch {
    // Changes remain available for the current session.
  }
  render();
  $("status").textContent = message;
}

$("create").addEventListener("click", () => {
  form.reset();
  hostname.setCustomValidity("");
  provision.showModal();
  hostname.focus();
});
$("cancel").addEventListener("click", () => provision.close());
hostname.addEventListener("input", () => hostname.setCustomValidity(""));

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = new FormData(form);
  const name = values.get("hostname");
  if (workspace.instances.some((server) => server.name === name)) {
    hostname.setCustomValidity("Use a hostname that is unique in this workspace.");
    hostname.reportValidity();
    return;
  }
  workspace.instances.unshift({ name, plan: values.get("plan"), os: values.get("os"), running: true });
  provision.close();
  commit(`Provisioned ${name}`);
});

$("instances").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const row = button.closest(".instance");
  const server = workspace.instances.find((instance) => instance.name === row.dataset.name);
  const action = button.dataset.action;
  if (action === "restart") {
    commit(`Restarted ${server.name}`);
  } else {
    server.running = !server.running;
    commit(`${server.running ? "Started" : "Stopped"} ${server.name}`);
  }
  const updatedRow = Array.from($("instances").children).find((item) => item.dataset.name === server.name);
  updatedRow.querySelector(`[data-action="${action}"]`).focus();
});

$("reset").addEventListener("click", () => {
  if (!window.confirm("Reset the demo and discard your simulated servers and activity?")) return;
  workspace = sampleWorkspace();
  workspace.activity = [];
  commit("Reset sample workspace");
});

render();

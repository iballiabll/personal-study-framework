"use strict";

const get = (id) => document.getElementById(id);
const recite = window.IballVocabRecite;
const study = window.IballStudy;
const draftKey = "study-framework-draft-v1";
let audioUrl = "";

function textWithin(value, maximum) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maximum;
}

function validPack(pack) {
  if (pack?.version !== 1 || !Array.isArray(pack.vocabulary) ||
      !Array.isArray(pack.questions) || pack.vocabulary.length > 1000 ||
      pack.questions.length > 1000) return false;

  return pack.vocabulary.every((entry) => textWithin(entry?.word, 120) && textWithin(entry?.meaning, 1000)) &&
    pack.questions.every((item) =>
      typeof item?.id === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(item.id) &&
      textWithin(item.prompt, 4000) &&
      (item.passage === undefined || (typeof item.passage === "string" && item.passage.length <= 20000)) &&
      Array.isArray(item.options) && item.options.length >= 2 && item.options.length <= 8 &&
      item.options.every((option) => textWithin(option, 500)) &&
      Number.isInteger(item.answer) && item.answer >= 0 && item.answer < item.options.length
    ) && new Set(pack.questions.map((item) => item.id)).size === pack.questions.length;
}

function element(tag, text = "") {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}

function button(label, action) {
  const node = element("button", label);
  node.type = "button";
  node.addEventListener("click", action);
  return node;
}

function renderWords(words) {
  const list = get("word-list");
  list.textContent = words.length ? "" : "资料中没有词卡。";

  for (const { word, meaning } of words) {
    const card = element("article");
    const current = recite.getRecord("personal", word);
    const status = element("p", current ? recite.statusLabel(current.status) : "待复习");
    card.append(element("h3", word), element("p", meaning), status);
    for (const [value, label] of Object.entries(recite.statuses)) {
      card.append(button(label, () => {
        recite.record({ deck: "personal", word, status: value });
        status.textContent = label;
        get("word-status").textContent = `已记录 ${word} 的复习状态。`;
      }));
    }
    list.append(card);
  }
}

function renderQuestions(questions) {
  const list = get("question-list");
  list.textContent = questions.length ? "" : "资料中没有练习。";

  for (const item of questions) {
    const card = element("article");
    if (item.passage) card.append(element("p", item.passage));
    card.append(element("h3", item.prompt));
    const feedback = element("p");
    feedback.setAttribute("role", "status");
    item.options.forEach((option, index) => {
      card.append(button(option, () => {
        window.ExamScores.recordObjective({
          exam: "cet4",
          paperId: item.id,
          sectionId: "imported",
          questionNo: 1,
          chosen: String(index),
          answer: String(item.answer),
          verified: true,
        });
        feedback.textContent = index === item.answer ? "回答正确。" : "回答有误，请再试一次。";
        get("quiz-status").textContent = "本次作答已记录。";
      }));
    });
    card.append(feedback);
    list.append(card);
  }
}

get("pack").addEventListener("change", async (event) => {
  const input = event.currentTarget;
  const [file] = input.files;
  if (!file) return;
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error("文件超过 5 MB。");
    const pack = JSON.parse(await file.text());
    if (!validPack(pack)) throw new Error("资料格式不符，请查看仓库中的 JSON 结构说明。");
    renderWords(pack.vocabulary);
    renderQuestions(pack.questions);
    get("pack-status").textContent = `已读取 ${pack.vocabulary.length} 张词卡和 ${pack.questions.length} 项练习。`;
  } catch (error) {
    get("pack-status").textContent = `读取失败。${error.message}`;
  } finally {
    input.value = "";
  }
});

get("audio-file").addEventListener("change", (event) => {
  const [file] = event.currentTarget.files;
  if (!file) return;
  const player = get("player");
  if (audioUrl) URL.revokeObjectURL(audioUrl);
  audioUrl = URL.createObjectURL(file);
  player.src = audioUrl;
  player.hidden = false;
});

get("compare").addEventListener("click", () => {
  const reference = get("reference").value.trim();
  const transcript = get("transcript").value.trim();
  if (!reference || !transcript) {
    get("comparison").textContent = "请填写参考文本和练习文本。";
    return;
  }
  const result = study.scoreText(transcript, reference);
  get("comparison").textContent =
    `词级匹配率 ${result.percent}%。遗漏 ${result.missing.length} 个，多出 ${result.extras.length} 个。`;
});

const draft = get("draft");
draft.value = study.readStore(draftKey, "");
draft.addEventListener("input", () => study.writeStore(draftKey, draft.value));
get("grade").addEventListener("click", () => {
  const result = window.IBALL_WRITING_GRADE.grade({
    exam: "cet4",
    text: draft.value.trim(),
    prompt: { prompt: get("writing-prompt").value.trim() },
  });
  get("writing-result").textContent = result
    ? `练习估分 ${result.score}/${result.maxScore}，识别到 ${result.issueCount} 项语言问题。`
    : "请先填写草稿。";
});

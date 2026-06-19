const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const FILE = "./chatlog.json";

// 파일 없으면 생성
if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, "[]");
}

/* =========================
   1. 채팅 저장
========================= */
app.get("/log", (req, res) => {

    const room = req.query.room || "unknown";
    const sender = req.query.sender || "unknown";
    const msg = req.query.msg || "";
    const time = new Date().toLocaleString("ko-KR");

    let data = JSON.parse(fs.readFileSync(FILE));

    data.push({ room, sender, msg, time });

    if (data.length > 200) data.shift();

    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

    res.json({ status: "saved" });
});

/* =========================
   2. 채팅 조회
========================= */
app.get("/getlog", (req, res) => {

    let data = JSON.parse(fs.readFileSync(FILE));
    data = data.slice(-20);

    res.json(data);
});

/* =========================
   3. 테스트
========================= */
app.get("/ping", (req, res) => {
    res.json({ ok: true });
});

app.get("/kakao", (req, res) => {
    res.json({
        ok: true,
        message: "카카오 연결 성공"
    });
});

app.use(express.json());

app.post("/kakao", (req, res) => {
    const text = req.body.text;

    res.json({
        ok: true,
        message: "받은 메시지: " + text
    });
});

/* =========================
   4. 카카오 연결 (여기 중요)
========================= */
app.post("/kakao", (req, res) => {

    const msg = req.body.userRequest?.utterance || "";

    // 1) 기본 자동응답
    if (msg.includes("안녕")) {
        return res.json({
            version: "2.0",
            template: {
                outputs: [
                    { simpleText: { text: "안녕하세요 😊" } }
                ]
            }
        });
    }

    // 2) 테스트 명령
    if (msg === "!핑") {
        return res.json({
            version: "2.0",
            template: {
                outputs: [
                    { simpleText: { text: "pong 🏓" } }
                ]
            }
        });
    }

    // 3) 기본 응답
    res.json({
        version: "2.0",
        template: {
            outputs: [
                { simpleText: { text: "무슨 말인지 모르겠어요 🤔" } }
            ]
        }
    });
});

/* =========================
   서버 실행
========================= */
app.listen(3000, () => {
    console.log("서버 실행중");
});

class characterDialogue {
	constructor(edgeMessages, enduranceMessages) {
		this.messages = {}
		messages.edgeMessages = edgeMessages;
		messages.enduranceMessages = enduranceMessages;
	}

	appendMessage (message, type, passType) {
		this.messages[type][passType].push(message);
	}
}

class message {
	constructor (msg, minTime, maxTime, beatRate) {
		this.msg = msg;
		this.minTime = minTime;
		this.maxTime = maxTime;
		this.beatRate = beatRate;
	}
}

var messages = {
    "first": [
        { msg: "咱们开始吧，先暖身撸一会儿，等'边缘'条到头就停下。", minTime: 30, maxTime: 50, beatRate: 2.5 }
    ],
    "go": [
        { msg: "撸起来!", minTime: 20, maxTime: 45, beatRate: 2.5 },
        { msg: "使出吃奶的劲儿快速撸", minTime: 8, maxTime: 15, beatRate: 5 },
        { msg: "使出吃奶的劲儿快速撸", minTime: 8, maxTime: 15, beatRate: 5 },
        { msg: "撸起来！", minTime: 20, maxTime: 45, beatRate: 2.2 },
        { msg: "撸起来！", minTime: 20, maxTime: 45, beatRate: 2.7 },
        { msg: "撸一撸", minTime: 20, maxTime: 45, beatRate: 2.7 },
        { msg: "撸起来！", minTime: 20, maxTime: 45, beatRate: 2 },
        { msg: "撸一撸", minTime: 20, maxTime: 45, beatRate: 2.2 },
        { msg: "撸一撸", minTime: 20, maxTime: 45, beatRate: 2.5 },
        { msg: "慢慢来，稳扎稳打...", minTime: 45, maxTime: 70, beatRate: 1 },
        { msg: "换只手试试！", minTime: 20, maxTime: 45, beatRate: 2.5 },
        { msg: "换只手试试！", minTime: 20, maxTime: 45, beatRate: 3 },
        { msg: "轻轻地撸", minTime: 15, maxTime: 30, beatRate: 2.5 },
        { msg: "轻轻地撸", minTime: 25, maxTime: 45, beatRate: 1.5 },
        { msg: "撸起来！", minTime: 20, maxTime: 45, beatRate: 2.2 },
        { msg: "撸起来！", minTime: 20, maxTime: 45, beatRate: 2.5 }
    ],
    "stop": [
        { msg: "停！冷静一下...", minTime: 15, maxTime: 30 },
        { msg: "莫挨着！", minTime: 20, maxTime: 30 },
        { msg: "停！歇会儿。", minTime: 7, maxTime: 15 },
        { msg: "停！歇会儿。", minTime: 7, maxTime: 15 },
        { msg: "手拿开！", minTime: 10, maxTime: 25 },
        { msg: "手拿开！", minTime: 10, maxTime: 25 },
        { msg: "手拿开！", minTime: 10, maxTime: 25 },
        { msg: "手拿开！", minTime: 10, maxTime: 25 },
        { msg: "停", minTime: 10, maxTime: 20 },
        { msg: "停", minTime: 10, maxTime: 25 },
        { msg: "停", minTime: 10, maxTime: 15 },
        { msg: "停", minTime: 10, maxTime: 20 },
        { msg: "莫挨着！", minTime: 10, maxTime: 20 }
    ],
    "finish": [
        { msg: "射！马上就射！", minTime: 15, maxTime: 20, beatRate: 4 },
        { msg: "射！慢慢来，不急不急 ;3", minTime: 50, maxTime: 70, beatRate: 2 },
        { msg: "现在就射！", minTime: 25, maxTime: 35, beatRate: 2.6 },
        { msg: "射!", minTime: 25, maxTime: 40, beatRate: 2.6 },
        { msg: "你还有10秒开始射，不然就前功尽弃咯！", minTime: 11, maxTime: 11, beatRate: 5 },
        { msg: "现在可以射了。开始！", minTime: 20, maxTime: 30, beatRate: 3 }
    ],
    "noCum": [
        { msg: "停！对不住，这回没你的份儿。再来一次，没准儿下回你就走大运了...", minTime: 30, maxTime: 30 }
    ]
};
var messagesEndurance = {
    "average": [
        { msg: "干得好，就这么继续！", minTime: 45, maxTime: 60 },
        { msg: "歇息片刻，继续加油！", minTime: 45, maxTime: 60 },
        { msg: "干得不错，相信你还能再坚持一会儿！", minTime: 45, maxTime: 60 },
        { msg: "还没完呢，我想看你再多边缘一会儿 ;3", minTime: 45, maxTime: 60 },
    ],
    "gentle": [
        { msg: "干得好，就这么继续！", minTime: 45, maxTime: 60 },
        { msg: "歇息片刻，继续加油！", minTime: 45, maxTime: 60 },
        { msg: "再来一点点，你行的！", minTime: 45, maxTime: 60 },
    ],
    "evil": [
        { msg: "还没完呢，我想看你再多边缘一会儿 ;3", minTime: 30, maxTime: 40 },
        { msg: "不错，现在准备接受更多...", minTime: 30, maxTime: 40 },
        { msg: "好，咱们继续，别停下！", minTime: 30, maxTime: 40 },
        { msg: "我要你给我更多，继续保持！", minTime: 30, maxTime: 40 },
        { msg: "我究竟要让你边缘多久呢，我在想...", minTime: 30, maxTime: 40 },
        { msg: "嗯，我觉得你边缘的时间还不够长呢！", minTime: 30, maxTime: 40 },
    ]
};
var messagesEnduranceEvilLong = [
    { msg: "嘿嘿嘿，你可有得受了，我现在欲火中烧...", minTime: 20, maxTime: 35 },
    { msg: "想要高潮？那就得好好努力赢得它。", minTime: 20, maxTime: 35 },
    { msg: "咱们远未结束，做好准备吧...", minTime: 20, maxTime: 35 },
];

var screen_width = 640;
var screen_height = 480;

var ball_cols = 5;
var ball_rows = 5;

var ball_speed = screen_height / ball_rows;
var panel_speed = screen_width / ball_cols;

var score_eaten = 1000;
var score_miss = -10;

var game = {};

game.current_situation = {
	balls : [],
	panel : {
		locate : 0,
		width : 128,
		height : 32
	},
	hid : ""
};

game.actions = [
	"left",
	"right",
	"stop"
];

function copy_s(s)
{
	var s1 = {};
	s1.balls = [];
	s1.panel = {
		locate : s.panel.locate,
		width : 128,
		height : 32
	};
	s1.hid = s.hid;

	for(var i = 0; i < ball_rows; i ++)
	{
		s1.balls[i] = [];
		for(var j = 0; j < ball_cols; j ++)
		{
			s1.balls[i][j] = s.balls[i][j];
		}
	}
	return s1;
}

game.init = function()
{
	var thiz = game;
	thiz.current_situation.panel.locate = screen_width / 2 - thiz.current_situation.panel.width / 2;

	for(var i = 0; i < ball_rows; i ++)
	{
		thiz.current_situation.balls[i] = [];
		for(var j = 0; j < ball_cols; j ++)
		{
			thiz.current_situation.balls[i][j] = 0;
		}
	}
	return thiz.current_situation;
}

function movepanel(p, a)
{
	switch(a)
	{
		/// left
		case 0:
			if(p.locate - panel_speed > 0)
				p.locate -= panel_speed;
		break;

		case 1:
			if(p.locate + panel_speed < screen_width)
				p.locate += panel_speed;
		break;
		
		case 2:
		break;
	}
}

function moveballs(balls)
{
	for(var j = 0; j < ball_cols; j ++)
	{
		for(var i = ball_rows - 1; i >= 0; i --)
		{
			if(balls[i][j] == 1)
			{
				balls[i][j] = 0;
				if(i < ball_rows - 1)
				{
					balls[i + 1][j] = 2;
				}
			}
		}
	}

	for(var i = 0; i < ball_rows; i ++)
	{
		for(var j = 0; j < ball_cols; j ++)
		{
			if(balls[i][j] == 2)
			{
				balls[i][j] = 1;
			}
		}
	}

}

game.update = function()
{
	var thiz = game;
	var s = thiz.current_situation;
	var hid = "";

	moveballs(s.balls);

	if(Math.random() > 0.5)
	{
		var rand = Math.round(Math.random() * (ball_cols - 1));
		s.balls[0][rand] = 1;
	}

	for(var i = 0; i < ball_rows; i ++)
	{
		for(var j = 0; j < ball_cols; j ++)
		{
			var b = s.balls[i][j];
			if(b == 1)
			{
				hid = hid + "[" + j + "," + i + "]";
			}
			
		}
	}

	s.hid = hid;
}

game.callback_reward = function(s_o, a)
{
	var r = 0;
	var thiz = game;

	var s = copy_s(s_o);

	
	var w = s.panel.width;
	var t = s.panel.height;

	movepanel(s.panel, a);

	var jpl = s.panel.locate;

	moveballs(s.balls);

	var margin = screen_width / ball_cols;
	for(var j = 0; j < ball_cols; j ++)
	{
		var b = s.balls[ball_rows - 1][j];

		if(b == 1)
		{
			if(j * margin < jpl + w / 2 && j * margin > jpl - w / 2)
			{
				r += score_eaten;
			}
			else
			{
				r += score_miss;
			}
		}
	}

	return r;
}

game.callback_update_situation = function(a)
{
	var thiz = game;
	var s = thiz.current_situation;

	movepanel(s.panel, a);

	thiz.update();
	return thiz.current_situation;
}

game.callback_get_next_situation = function(a)
{
	var thiz = game;
	var s = copy_s(thiz.current_situation);

	movepanel(s.panel, a);

	moveballs(s.balls);

	return s;
}

game.callback_if_over = function(a)
{
	return false;
}

game.callback_repaint = function()
{
	var thiz = game;
	var ctx = thiz.ctx;
	var s = thiz.current_situation;

	ctx.fillStyle="black";
	ctx.fillRect(0, 0, screen_width, screen_height);

	ctx.fillStyle="yellow";
	var bw = screen_width / ball_cols;
	var bh = screen_height  / ball_rows;
	for(var i = 0; i < ball_rows; i ++)
	{
		for(var j = 0; j < ball_cols; j ++)
		{
			if(s.balls[i][j] == 1)
			{
				ctx.beginPath();
				ctx.arc(j * bw, i * bh, 10, 0, 2*Math.PI);
				ctx.fill();
			}
		}
	}

	ctx.fillStyle="blue";
	ctx.fillRect(s.panel.locate - s.panel.width / 2, screen_height - s.panel.height, s.panel.width, s.panel.height);
}
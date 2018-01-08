/**
 * Params
 */
var params_alpha = 0.4;
var run_speed = 1;
var run_loop = null;
/**
 * Global var
 */
var sect = 0;
var qualities = {};
var actions_index = [0, 1, 2];
var situation = null;

/**
 * Callback functions
 */
/* Game callbacks */
var callback_reward = null;
var callback_update_situation = null;
var callback_get_next_situation = null;
var callback_if_over = null;
var callback_repaint = null;

function maxQ(s1)
{
	var select = 0;
	var max_q = 0.0;
	var acts = qualities[s1.hid];
	if(acts == undefined)
	{
		qualities[s1.hid] = [];
		for(var i = 0; i < actions_index.length; i ++)
		{
			qualities[s1.hid][actions_index[i]] = Math.random() * 1.0;
		}
		acts = qualities[s1.hid];
	}

	for(var i = 0; i < actions_index.length; i ++)
	{
		var q = acts[i];
		if(q > max_q)
		{
			max_q = q;
			select = i;
		}
	}
	return max_q;
}

function Q(s, a)
{
	var s1 = callback_get_next_situation(a);
	var r = callback_reward(s, a);
	var q = params_alpha * r + (1.0 - params_alpha) * maxQ(s1);
	return q;
}

function update_q(s, a)
{
	var q = Q(s, a);
    qualities[s.hid][a] = q;
}

function action(situation)
{
	var select = 0;
	var max_q = 0.0;
	for(var i = 0; i < actions_index.length; i ++)
	{
		if(Math.random() < 0.01)
		{
			select = i;
			break;
		}
		if(qualities[situation.hid] == undefined || qualities[situation.hid] == null)
		{
			qualities[situation.hid] = [];
		}

		var q = qualities[situation.hid][actions_index[i]];
		if(q == undefined)
		{
			qualities[situation.hid][actions_index[i]] = Math.random() * 1.0;
			q = qualities[situation.hid][actions_index[i]];
		}
		else if(q > 1.0)
		{
			console.log("selected Q ", q);
		}

		if(q > max_q)
		{
			max_q = q;
			select = i;
		}
	}
	return actions_index[select];
}


function section()
{
	console.log("section " + sect + " go!");
	run_loop = window.setInterval(
	function()
	{
		var a = action(situation);
		var s = callback_update_situation(a);

		if(callback_if_over(s))
		{
			window.clearInterval(itv);
		}

		update_q(s, a);

		callback_repaint();
	}, run_speed);
}

function main(gm)
{
	situation = gm.init();

	callback_update_situation = gm.callback_update_situation;
	callback_if_over = gm.callback_if_over;
	callback_reward = gm.callback_reward;
	callback_get_next_situation = gm.callback_get_next_situation;
	callback_repaint = gm.callback_repaint;

	section();
}
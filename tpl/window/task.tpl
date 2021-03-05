<script id="tpl-tasks-by-npc" type="text/x-dot-template">

<div class="window resizable" style="width: 580px; min-height: 473px; height: 473px;">
<div class="header">
	<span>Tasks related to NPC {@$npc.name} {@serialize_db_id($npc.id)}</span>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="maximize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows">
	<div class="border flex-rows">
		<div class="header flex-columns flex-all" style="margin-bottom: 5px;">
			<span>Tasks given: ({@($tasks_out.tasks || []).filter(t => t).length})</span>
			<span>Tasks completed: ({@($tasks_in.tasks || []).filter(t => t).length})</span>
		</div>
		<div class="scroll flex-columns flex-all">
			<div class="tasks">
				{for tid of ($tasks_out?.tasks || [])}
					{if !$tid}{continue}{/if}
					<div>{@$win.print_task_by_id($tid)}</div>
				{/for}
			</div>
			<div class="tasks" style="padding-right: 5px;">
				{for tid of ($tasks_in?.tasks || [])}
					{if !$tid}{continue}{/if}
					<div>{@$win.print_task_by_id($tid)}</div>
				{/for}
			</div>
		</div>
	</div>
</div>

{@@
<style>
.window > .content {
	overflow: hidden;
}

.border {
	background-color: rgba(251, 241, 241, 1);
	border: 1px solid rgba(224, 176, 176, 1);
	overflow: hidden;
	padding: 5px;
	padding-right: 0;
	background-color: #5d5959;
	color: gray;
}

.border > .header {
	color: white;
	font-weight: bold;
}

.scroll {
	overflow-y: auto;
	overflow-x: hidden;
	height: auto;
	font-weight: 400;
	outline: none;
}

.tasks {
	display: flex;
	flex-direction: column;
	row-gap: 3px;
}

.tasks > * {
	padding: 4px 6px;
	background-color: #3a3a3a;
}
</style>
@@}
</script>

<script id="tpl-tasks" type="text/x-dot-template">

<div class="window resizable" style="width: 1050px; min-height: 800px; height: 800px;">
<div class="header">
	<span>Task: {@($task?.name || '').replace(/\^[0-9a-fA-F]\{6\}/g, '')} {@serialize_db_id($task.id)}</span>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="maximize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows">

	<div id="toptasks" class="flex-columns flex-all">
		<div class="tasks flex-rows">
			<div class="header">Required quests:</div>
			{for req_tid of ($task.premise_quests || [])}
				<div class="task">{@TaskWindow.print_task_by_id($req_tid)}</div>
			{/for}
			<div class="add-container"><div style="flex: 1;"></div><a class="button add">(add) <i class="fa fa-plus"></i></a></div>
		</div>
		<div class="tasks flex-rows">
			<div class="header">Mutually exclusive quests:</div>
			{for mutex_tid of ($task.mutex_quests || [])}
				<div class="task">{@TaskWindow.print_task_by_id($mutex_tid)}</div>
			{/for}
			<div class="add-container"><div style="flex: 1;"></div><a class="button add">(add) <i class="fa fa-plus"></i></a></div>
		</div>
		<div class="tasks flex-rows">
			<div class="header">Next quests:</div>
			{for next_task of ($win.next_tasks || [])}
				<div class="task">{@TaskWindow.print_task_name($next_task.name)} {@serialize_db_id($next_task.id)}</div>
			{/for}
		</div>
	</div>

	<div id="container" style="flex: 1; display: flex; margin-top: 5px; column-gap: 5px;">
		<div class="left tasks" style="padding: 3px; min-width: 200px;">
			<ul class="tree">
				<li id="root_task" data-id="{@$root_task.id}" class="task root" onclick="{serialize $win}.select_subquest(event)">
					<a class="taskbtn">{@TaskWindow.print_task_name($root_task.name)} {@serialize_db_id($root_task.id)}</a>
					{@TaskWindow.print_subquests($root_task)}
				</li>
			</ul>
		</div>

		<div id="body" class="right">
			<div class="base-info" style="display: flex; align-items: baseline; column-gap: 5px;">
				<div class="data-field" style="flex: 1;">
					<span style="width: 45px;">Name:</span>
					<div class="pw-editable-color-text" style="flex: 1; margin-right: 5px; min-width: 275px;" data-editable-color-text data-link="{serialize $task} => 'name'"></div>
				</div>
				{if !$task.parent_quest}
					<div class="data-field" style="flex-wrap: wrap;">
						<div class="flex-columns" style="align-items: baseline;">
							<span style="width: 45px;">Icon:</span>
							<span data-select="TaskWindow.task_types" data-link="{serialize $task} => 'type'" style="width: auto; min-width: 100px; flex: 1;"></span>
						</div>
						<div class="flex-columns" style="align-items: baseline;">
							<span style="min-width: 45px;">Repeatable:</span>
							<span data-select="TaskWindow.avail_frequency_types" data-link="{serialize $task} => 'avail_frequency'" style="width: auto; min-width: 100px; flex: 1;"></span>
						</div>
					</div>
				{/if}
			</div>

			<div>Requirements: {if $task.parent_quest}Inherited from the root quest{/if}</div>
			{if !$task.parent_quest}
			<div class="requirements" style="display: flex; flex-wrap: wrap; column-gap: 15px; row-gap: 5px;">
				<div class="data-field">
					<span>Level:</span>
					<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'premise_level_min'"></span>
					<span>-</span>
					<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'premise_level_max'"></span>
				</div>
				<div class="data-field">
					<span>Reputation:</span>
					<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'premise_reputation_min'"></span>
					<span>-</span>
					<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'premise_reputation_max'"></span>
				</div>
				<div class="data-field">
					<span>Min. cultivation:</span>
					<span data-select="TaskWindow.cultivation_levels" data-link="{serialize $task} => 'premise_cultivation'" style="width: auto; min-width: 150px;"></span>
				</div>
				<div class="data-field">
					<span>Min. faction rank</span>
					<span data-select="TaskWindow.faction_ranks" data-link="{serialize $task} => 'premise_faction_role'" style="width: auto; min-width: 75px;"></span>
				</div>
				<div class="data-field">
					<span>Gender</span>
					<span data-select="TaskWindow.genders" data-link="{serialize $task} => 'premise_gender'" style="width: auto; min-width: 75px;"></span>
				</div>
				<label><input type="checkbox" data-link="{serialize $task} => 'premise_be_married'" class="checkbox"><span>Must be Married</span></label>
				<label><input type="checkbox" data-link="{serialize $task} => 'premise_be_gm'" class="checkbox"><span>Must be a GM</span></label>

				<div style="display: flex; flex-wrap: wrap; column-gap: 5px;">
					<span>Class: </span>
					{for pwclass of TaskWindow.classes}
						<label><input type="checkbox" class="checkbox pw-class" data-id="{@$pwclass.id}" checked><span>{@$pwclass.name}</span></label>
					{/for}
				</div>

				<div class="data-field">
					<span>Blacksmith Lv.: </span>
					<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'premise_blacksmith_level'"></span>
				</div>
				<div class="data-field">
					<span>Tailor Lv.: </span>
					<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'premise_tailor_level'"></span>
				</div>
				<div class="data-field">
					<span>Craftsman Lv.: </span>
					<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'premise_craftsman_level'"></span>
				</div>
				<div class="data-field">
					<span>Apothecary Lv.: </span>
					<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'premise_apothecary_level'"></span>
				</div>
				<div class="data-field">
					<span>Coins:</span>
					<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'coins'"></span>
				</div>
				<div id="premise_items" class="data-field" style="align-items: unset;">
					<span>Items: </span>
					{assign idx = -1}
					{for item of ($task.premise_items || [])}
						{$idx++}
						{if !$item?.id}{continue}{/if}
						<div class="item-w-cnt">
							<span class="item" oncontextmenu="this.onclick(event); return false;" onclick="{serialize $win}.item_onclick('premise', {@$idx}, event);" ondblclick="{serialize $win}.item_ondblclick('premise', {@$idx}, event);" data-idx="{@$idx}" tabindex="0"><img{ } src="{@Item.get_icon_by_item(db, $item?.id || -1)}"></span>
							<span data-input class="input-number" style="width: 28px; font-size: 12px; padding: 3px;" data-link="{serialize $task} => 'premise_items', {@$idx}, num" data-placeholder="(0)"></span>
						</div>
					{/for}
					<span class="item" tabindex="0"><img src="{@ROOT_URL}img/item-add.jpg" onclick="{serialize $win}.item_add_onclick('premise');"></span>
				</div>

				<label><input type="checkbox" class="checkbox" data-link="{serialize $task} => 'remove_premise_items'"><span>Remove Items/Coins from EQ</span></label>
			</div>
			{/if}

			<div class="tab_menu_container" style="margin-top: 4px; display: flex;">
				<span class="header">Start by:</span>
				<div class="tab_menu start_by">
					{for tab of TaskWindow.tabs_obtain_ways}
						<label data-id="{@$tab.id}" onclick="{serialize $win}.select_tab('start_by', {@$tab.id});"><input type="radio" name="tab_start_by">{@$tab.name}</label>
					{/for}
				</div>
				<a class="button menu-triangle" id="start_by_btn" style="margin-top: 1px; margin-bottom: 2px; margin-left: 10px;" oncontextmenu="return false;" onmousedown="{serialize $win}.onclick_start_by(this, event);">Text</a>
			</div>
			<div class="tab_menu_container" style="display: flex;">
				<span class="header">Goal: {if $task.sub_quests}completed by subquest{/if}</span>
				{if !$task.sub_quests?.length}
					<div class="tab_menu goal">
						{for tab of TaskWindow.tabs_goals}
							<label data-id="{@$tab.id}" onclick="{serialize $win}.select_tab('goal', {@$tab.id});"><input type="radio" name="tab_type">{@$tab.name}</label>
						{/for}
					</div>
				{/if}

			</div>

			{if $task.sub_quests?.length}
				<div class="tab_menu_container" style="margin-top: 4px; display: flex;">
					<span class="header">Activate subquests:</span>
					<div class="tab_menu sub_quest_activation">
						{for tab of TaskWindow.tabs_sub_quest_activation}
							<label data-id="{@$tab.id}" onclick="{serialize $win}.select_tab('sub_quest_activation', {@$tab.id});"><input type="radio" name="tab_type">{@$tab.name}</label>
						{/for}
					</div>
				</div>
			{else}
				<div class="tabs goal">
					<div>{* None *}</div>
					<div>
						Kill Monsters
					</div>

					<div>
						Obtain Regular Items
					</div>

					<div>
						None
					</div>

					<div>
						Wait
					</div>
				</div>
			{/if}

			<div style="margin-top: 5px;">Dialogue:</div>
			<div class="tab_menu dialogue dialogue_tabs">
				<div data-id="initial" onclick="{serialize $win}.select_tab('dialogue', 'initial');" style="{if $task.parent_quest}display: none;{/if}">Initial</div>
				<div data-id="notqualified" onclick="{serialize $win}.select_tab('dialogue', 'notqualified');" style="{if $task.parent_quest}display: none;{/if}">Requirements not met</div>
				<div data-id="unfinished" onclick="{serialize $win}.select_tab('dialogue', 'unfinished');">In progress</div>
				<div data-id="ready" onclick="{serialize $win}.select_tab('dialogue', 'ready');" style="{if $task.sub_quests?.length || !$task.parent_quest}display: none;{/if}">Ready to finish</div>
			</div>
			<div id="dialogue">
				<ul class="diagram" style="margin-bottom: -5px;">
					<li class="start"><span>NPC</span><ul>
						{if $win.sel_opts.dialogue}
							{@TaskWindow.print_question($task.dialogue[$win.sel_opts.dialogue], 1)}
						{/if}
					</ul></li>
				</ul>
			</div>

			<div>Awards</div>
			<div>Easy extras - can give up, can retake, can retake after failure, time limit</div>
			<div>Extras -> fail on death, marriage quest, inv expansion, date spans, ai trigger, instant teleport, simultaneous player limit, recommended level, show_quest_title, show_as_gold_quest, is_craft_skill_quest, can_be_found, show_direction, special award type</div>
		</div>
	</div>
</div>

{@@
<style>
#dialogue {
	background-color: #737373;
	border: 2px solid #2b2b2b;
	padding: 5px;
	position: relative;
}

#dialogue:after {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: #000;
	opacity: 0.15;
	pointer-events: none;
}

.dialogue_tabs {
	display: flex;
	column-gap: 4px;
}

.dialogue_tabs > * {
	background-color: #313131;
	border: 2px solid #2b2b2b;
	border-bottom: none;
	padding: 4px 6px;
	margin-bottom: -2px;
	color: #adada5;
	font-weight: bold;
	cursor: pointer;
}

.dialogue_tabs > .active {
	color: #d9d9be;
	background-color: #626262;
	z-index: 1;
}

.data-field {
	display: flex;
	align-items: baseline;
	column-gap: 4px;
	row-gap: 4px;
}

.diagram, .diagram ul, .diagram li {
	list-style: none;
	margin: 0;
	padding: 0;
	position: relative;
}

.diagram {
	margin: 0 0 1em;
	text-align: center;
}
.diagram, .diagram ul {
}
.diagram ul {
	width: 100%;
}

.diagram li {
	display: table-cell;
	padding: .5em 0;
	vertical-align: top;
	max-width: 400px;
	min-width: 200px;
}

.diagram li:before {
	outline: solid 1px #333;
	content: "";
	left: 0;
	position: absolute;
	right: 0;
	top: 0;
}

.diagram li:first-child:before { left: 50%; }
.diagram li:last-child:before { right: 50%; }

.diagram span {
	border: solid .1em #333;
	border-radius: .2em;
	display: inline-block;
	margin: 0 .2em .5em;
	padding: .2em .5em;
	position: relative;
	font-size: 10pt;
	font-weight: bold;
	background-color: #3a3a3a;
	color: white;
	text-align: left;
	min-width: 15px;
	min-height: 18px;
}

.diagram li.start > span {
	background: #bdbdbd;
	color: black;
}

.diagram li.choice > span {
	background-color: #561010;
}

/* | */
.diagram ul:before,
.diagram span:before {
	outline: solid 1px #333;
	content: "";
	height: .4em;
	left: 50%;
	position: absolute;
}

.diagram ul:before {
	top: -.5em;
}

.diagram span:before {
	top: -.55em;
}

/* The root node doesn't connect upwards */
.diagram > li { margin-top: 0; }
.diagram > li:before,
.diagram > li:after,
.diagram > li > span:before {
outline: none;
}

ul, li {
	margin: 0;
	padding: 0;
}

.tree {
	--indent-left: 4px;
	--indent-right: 7px;
	--li-margin-v: 3px;
}

.tree ul {
	margin-left: var(--indent-left);
}

.tree li {
	list-style-type: none;
	margin-left: var(--indent-right);
	margin-top: var(--li-margin-v);
	position: relative;
}

.tree li.root {
	margin-left: 0;
	margin-top: 0;
}

.tree li.root:before {
	content: unset;
}

.tree li:before {
	content: "";
	position: absolute;
	top: calc(-1 * var(--li-margin-v));
	left: calc(-1px - var(--indent-left));
	border-left: 1px solid #ccc;
	border-bottom: 1px solid #ccc;
	width: var(--indent-left);
	height: calc(8px + var(--li-margin-v));
}

.tree li:after {
	position:absolute;
	content:"";
	top:8px;
	left: calc(-1px - var(--indent-left));
	border-left: 1px solid #ccc;
	border-top:1px solid #ccc;
	width: var(--indent-left);
	height:100%;
}

.tree li:last-child:after  {
	display:none;
}

ul.tree>li:first-child:before {
	display:none;
}

.tree li a {
	display: inline-block;
	background-color: #2b2b2b;
	color: white;
	font-size: 11px;
	padding: 2px 4px;
	line-height: 15px;
	border: 1px solid #2b2b2b;
}

.tree li a:hover, .tree li a:hover+ul li a {
	background: #3a3a3a;
	border: 1px solid black;
}

.tree a.focused {
	background: #4e4e4e !important;
}

.tree li a:hover+ul li:after, .tree li a:focus+ul li:after,
.tree li a:hover+ul li:before, .tree li a:focus+ul li:before,
.tree li a:hover+ul:before, .tree li a:focus+ul:before,
.tree li a:hover+ul ul:before, .tree li a:focus+ul ul:before{
	border-color: #000;
}

.tabs > *:not(.active) {
	display: none;
}

.task {
	display: flex;
	flex-direction: column;
}

.task > .task > header:before {
	content: '-';
	display: inline-block;
	margin-right: 4px;
}

.tab_menu_container > .header {
	margin-right: 8px;
	margin-top: 2px;
}

.tab_menu > label {
	display: inline-block;
	padding: 3px 0;
	margin-right: 6px;
	margin-bottom: 2px;
	color: gray;
	height: auto;
	cursor: pointer;
}

.tab_menu > label > input {
	cursor: pointer;
	outline: none;
}

.tab_menu > label.active {
	margin-bottom: 0;
	border-bottom: 2px solid #e0b0b0;
	color: rgb(80, 44, 44);
}

.add-container {
	display: flex;
	padding: 2px;
}

.add-container .add {
	font-size: 11px;
	padding: 0 4px;
}

.window > .content {
	overflow: hidden;
	background-color: #f7f9fa;
}

#container {
	overflow-x: hidden;
	overflow-y: scroll;
}

#body {
	background-color: #ffffff;
	padding: 5px;
	flex: 1;
}

.tasks {
	display: flex;
	flex-direction: column;
	row-gap: 1px;
}

.tasks > .header {
	padding: 2px 4px;
	padding-bottom: 0px;
	font-weight: bold;
}

.tasks > .task {
	font-size: 11px;
	padding: 0px 4px;
	background-color: #3a3a3a;
	color: white;
}

.tasks > .task:focus {
	border: 1px dotted white;
}

#toptasks > .tasks {
	background-color: #ffffff;
	max-height: 107px;
	overflow-y: auto;
	overflow-x: hidden;
}

#premise_items .item {
	cursor: pointer;
}
</style>
@@}
</script>


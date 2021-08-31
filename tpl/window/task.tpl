<script id="tpl-tasks-by-npc" type="text/x-dot-template">

<div class="window resizable" style="width: 580px; min-height: 473px; height: 473px;">
<div class="header {if $npc._removed}removed{/if}">
	<span>Tasks related to NPC {@$npc.name} {@DB.serialize_id($npc.id)}</span>
	<div class="menu">
		<i class="refresh fa fa-refresh"></i>
		<i class="details fa fa-ellipsis-v"></i>
	</div>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="maximize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows">
	<div id="tasks" class="border flex-rows">
		<div class="header flex-columns flex-all" style="margin-bottom: 5px;">
			<span>Tasks given: ({@$tasks_out?.tasks?.length || 0})</span>
			<span>Tasks completed: ({@$tasks_in?.tasks?.length || 0})</span>
		</div>
		<div class="scroll flex-columns flex-all">
			<div id="tasks_out" class="tasks">
				{assign idx = -1}
				{for tid of ($tasks_out?.tasks || [])}
					<div>
						{$idx++}
						<div class="num">{@$idx + 1}.</div>
						<a class="button button-dark menu-triangle" data-link-button="{serialize $tasks_out} => 'tasks', {@$idx}" data-select="db.tasks"></a>
						<a class="remove-btn" onclick="{serialize $win}.remove_quest('tasks_out', {@$idx});"><i class="close fa fa-minus-circle"></i></a>
					</div>
				{/for}
				<div class="add-container"><div style="flex: 1;"></div><a class="button add" onclick="{serialize $win}.add_quest('tasks_out');">(add) <i class="fa fa-plus"></i></a></div>
			</div>
			<div id="tasks_in" class="tasks" style="padding-right: 5px;">
				{assign idx = -1}
				{for tid of ($tasks_in?.tasks || [])}
					<div>
						{$idx++}
						<div class="num">{@$idx + 1}.</div>
						<a class="button button-dark menu-triangle" data-link-button="{serialize $tasks_in} => 'tasks', {@$idx}" data-select="db.tasks"></a>
						<a class="remove-btn" onclick="{serialize $win}.remove_quest('tasks_in', {@$idx});"><i class="close fa fa-minus-circle"></i></a>
					</div>
				{/for}
				<div class="add-container"><div style="flex: 1;"></div><a class="button add" onclick="{serialize $win}.add_quest('tasks_in');">(add) <i class="fa fa-plus"></i></a></div>
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
	overflow: hidden;
	padding: 5px;
	padding-right: 0;
}

.border > .header {
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
	display: flex;
	column-gap: 5px;
	align-items: baseline;
}

.tasks > * > .num {
	width: 30px;
	text-align: right;
}
</style>
@@}
</script>

<script id="tpl-tasks" type="text/x-dot-template">

<div class="window resizable" style="width: 1050px; min-height: 800px; height: 800px;">
<div class="header">
	<span>Task: {@($task?.name || '').replace(/\^[0-9a-fA-F]\{6\}/g, '')} {@DB.serialize_id($task.id)}</span>
	<div class="menu">
		<i class="details fa fa-ellipsis-v"></i>
	</div>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="maximize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows">
	<div id="toptasks" class="flex-columns flex-all">
		<div id="premise_quests" class="tasks flex-rows">
			<div class="header">Required quests:</div>
			{assign idx = -1}
			{for req_tid of ($root_task.premise_quests || [])}
				<div>
					{$idx++}
					<span>{@$idx + 1}.</span>
					<a class="button button-dark menu-triangle" data-link-button="{serialize $root_task} => 'premise_quests', {@$idx}" data-select="db.tasks" style="margin-top: 1px; margin-bottom: 1px;"></a>
					<div style="flex: 1;"></div>
					<a class="remove-btn" onclick="{serialize $win}.remove_quest('premise', {@$idx});"><i class="close fa fa-minus-circle"></i></a>
				</div>
			{/for}
			<div class="add-container"><div style="flex: 1;"></div><a class="button add" onclick="{serialize $win}.add_quest('premise');">(add) <i class="fa fa-plus"></i></a></div>
		</div>
		<div id="mutex_quests" class="tasks flex-rows">
			<div class="header">Mutually exclusive quests:</div>
			{assign idx = -1}
			{for req_tid of ($root_task.mutex_quests || [])}
				<div>
					{$idx++}
					<span>{@$idx + 1}.</span>
					<a class="button button-dark menu-triangle" data-link-button="{serialize $root_task} => 'mutex_quests', {@$idx}" data-select="db.tasks" style="margin-top: 1px; margin-bottom: 1px;"></a>
					<div style="flex: 1;"></div>
					<a class="remove-btn" onclick="{serialize $win}.remove_quest('mutex', {@$idx});"><i class="close fa fa-minus-circle"></i></a>
				</div>
			{/for}
			<div class="add-container"><div style="flex: 1;"></div><a class="button add" onclick="{serialize $win}.add_quest('mutex');">(add) <i class="fa fa-plus"></i></a></div>
		</div>
		<div class="tasks flex-rows">
			<div class="header">Next quests:</div>
			{for next_task of ($win.next_tasks || [])}
				<div class="task" style="cursor: pointer;" onclick="TaskWindow.open(\{ obj: db.tasks[{@$next_task.id}]\});">{@TaskWindow.print_task_name($next_task.name)} {@DB.serialize_id($next_task.id)}</div>
			{/for}
		</div>
	</div>

	<div id="container" style="flex: 1; display: flex; margin-top: 5px; column-gap: 5px;">
		<div class="left tasks" style="padding: 3px; min-width: 200px;">
			<ul class="tree">
				<li id="root_task" data-id="{@$root_task.id}" class="task root" oncontextmenu="this.onclick(event); return false;" onclick="{serialize $win}.select_subquest(event)">
					<a class="taskbtn">{@TaskWindow.print_task_name($root_task.name)} {@DB.serialize_id($root_task.id)}</a>
					{@TaskWindow.print_subquests($root_task)}
				</li>
			</ul>
		</div>

		<div id="scroll">
		<div id="body" class="right" onscroll="HTMLSugar.onscroll(event);">
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

			{assign remove_premise_items = false}
			<div>
				<div><span style="font-weight: bold;">Prerequisites:</span> {if $task.parent_quest}Inherited from the root quest{/if}</div>
				{if !$task.parent_quest}
				<div class="requirements" style="display: flex; flex-wrap: wrap; column-gap: 15px; row-gap: 5px; align-items: center; ">
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

					<div style="display: flex; flex-wrap: wrap; column-gap: 5px;">
						<span>Class: </span>
						{for pwclass of TaskWindow.classes}
							<label><input type="checkbox" class="checkbox pw-class" data-id="{@$pwclass.id}" checked><span>{@$pwclass.name}</span></label>
						{/for}
					</div>

					<div class="data-field">
						<span>Coins:</span>
						<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'premise_coins'"></span>
					</div>
					<div id="premise_items" class="data-field">
						<span>Items: </span>
						{assign idx = -1}
						{for item of ($task.premise_items || [])}
							{$idx++}
							<div class="item-w-cnt">
								<span class="item" data-link-item="{serialize $task} => 'premise_items', {@$idx}, 'id'" data-default-id="-1" oninput="{serialize $win}.cleanup_items('premise');" tabindex="0"></span>
								<span data-input class="input-number" style="width: 28px; font-size: 12px; padding: 3px;" data-link="{serialize $task} => 'premise_items', {@$idx}, 'amount'" data-placeholder="(0)"></span>
							</div>
						{/for}
						<span class="item" tabindex="0"><img src="{@ROOT_URL}img/item-add.jpg" onclick="{serialize $win}.item_add_onclick('premise');"></span>
					</div>

					<label><input type="checkbox" class="checkbox" data-link="{serialize $task} => 'remove_premise_items'"><span>Remove Items/Coins from EQ</span></label>
					{assign remove_premise_items = true}
				</div>
				{/if}
			</div>

			{if !$task.parent_quest}
				<div class="tab_menu_container" style="display: flex;">
					<span class="header" style="font-weight: bold;">Start by:</span>
					<div class="tab_menu start_by">
						{for tab of TaskWindow.tabs_obtain_ways}
							<label data-id="{@$tab.id}" onclick="{serialize $win}.select_tab('start_by', {@$tab.id});"><input type="radio" name="tab_start_by">{@$tab.name}</label>
						{/for}
					</div>
				</div>
				<div class="tabs start_by">
					<div>{* None *}</div>
					<div>{* Auto *}</div>
					<div>NPC: <a class="button menu-triangle" data-link-button="{serialize $task} => 'start_npc'" data-select="db.npcs" style="margin-top: 1px;" oninput="{serialize $win}.update_npc('start_npc', this);"></a>
					</div>
					<div class="flex-columns" style="flex-wrap: wrap; column-gap: 5px;">
						<span>Reach Location:</span>
						<span data-select="PWMap.maps_arr" data-link="{serialize $task} => 'start_on_enter_world_id'" style="width: auto; min-width: 100px; flex: 1;"></span>
						East:<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'start_on_enter_location', 'east'"></span>
						Bottom:<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'start_on_enter_location', 'bottom'"></span>
						South:<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'start_on_enter_location', 'south'"></span>
						West:<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'start_on_enter_location', 'west'"></span>
						Top:<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'start_on_enter_location', 'top'"></span>
						North:<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'start_on_enter_location', 'north'"></span>
					</div>
					<div>{* By Death *}</div>
				</div>
			{/if}

			<div class="tab_menu_container" style="display: flex;">
				<span class="header" ><span style="font-weight: bold;">Goal:</span> {if $task.sub_quests}completed by subquest{/if}</span>
				{if !$task.sub_quests?.length}
					<div class="tab_menu goal">
						{for tab of TaskWindow.tabs_goals}
							<label data-id="{@$tab.id}" onclick="{serialize $win}.select_tab('goal', {@$tab.id});"><input type="radio" name="tab_type">{@$tab.name}</label>
						{/for}
					</div>
				{/if}
			</div>

			{if $task.sub_quests?.length}
				<div class="tab_menu_container" style="display: flex;">
					<span class="header" style="font-weight: bold;">Activate subquests:</span>
					<div class="tab_menu sub_quest_activation">
						{for tab of TaskWindow.tabs_sub_quest_activation}
							<label data-id="{@$tab.id}" onclick="{serialize $win}.select_tab('sub_quest_activation', {@$tab.id});"><input type="radio" name="tab_type">{@$tab.name}</label>
						{/for}
					</div>
				</div>
			{else}
				<div class="tabs goal">
					<div>{* None *}</div>
					<div style="width: fit-content;">
						<div id="kill_monsters" >
							Kill monsters:
							{assign idx = -1}
							{for monster of ($task.req_monsters || [])}
								<div class="{if $monster.drop_item_id || $monster.drop_item_cnt}collect{/if}">
									{$idx++}
									<span class="always">{@$idx + 1}.</span>
									<a class="always button menu-triangle" data-link-button="{serialize $task} => 'req_monsters', {@$idx}, 'id'" data-select="db.monsters" style="margin-top: 1px; margin-bottom: 2px; margin-left: 10px;"></a>
									<label class="always" onclick="this.parentNode.classList.remove('collect');"><input type="radio" name="req_monster_type_{@$idx}" {if !$monster.drop_item_id && !$monster.drop_item_cnt}checked{/if}>Kill</label>
									<label class="always" style="margin-right: 8px;" onclick="this.parentNode.classList.add('collect');"><input type="radio" name="req_monster_type_{@$idx}" {if $monster.drop_item_id || $monster.drop_item_cnt}checked{/if}>Collect Item</label>
									<span>Count:</span>
									<span data-input class="input-number" style="width: 28px; font-size: 12px; padding: 3px;" data-link="{serialize $task} => 'req_monsters', {@$idx}, 'count'" data-placeholder="(0)"></span>
									<span class="item collect" data-link-item="{serialize $task} => 'req_monsters', {@$idx}, 'drop_item_id'" data-default-id="-1" tabindex="0"></span>
									<div class="collect flex-rows">
										<div class="flex-columns">
											<span style="display: inline-block; width: 16px;">x</span>
											<span data-input class="input-number" style="width: 28px; font-size: 12px; padding: 3px;" data-link="{serialize $task} => 'req_monsters', {@$idx}, 'drop_item_cnt'" data-placeholder="(0)"></span>
										</div>
										<div class="flex-columns">
											<span style="display: inline-block; width: 16px;">%</span>
											<span data-input class="input-number is_float" style="width: 28px; font-size: 12px; padding: 3px;" data-link="{serialize $task} => 'req_monsters', {@$idx}, 'drop_item_probability'" data-placeholder="(0)"></span>
										</div>
									</div>
									<div style="flex: 1;"></div>
									<a class="remove-btn always" onclick="{serialize $win}.remove_req_monster({@$idx});"><i class="close fa fa-minus-circle"></i></a>
								</div>
							{/for}
							<div class="add-container">
								<div style="flex: 1;"></div>
								<a class="button add" onclick="{serialize $win}.add_req_monster();">(add) <i class="fa fa-plus"></i></a>
							</div>
							<div>Report to NPC: <a class="button menu-triangle" data-link-button="{serialize $task} => 'finish_npc'" data-select="db.npcs" oninput="{serialize $win}.update_npc('finish_npc', this);"></a></div>
						</div>
					</div>

					<div>
						<div id="req_items" class="data-field">
							<span style="font-weight: bold;">Obtain Regular Items: </span>
							{assign idx = -1}
							{for item of ($task.req_items || [])}
								{$idx++}
								<div class="item-w-cnt">
									<span class="item" data-link-item="{serialize $task} => 'req_items', {@$idx}, 'id'" data-default-id="-1" oninput="{serialize $win}.cleanup_items('req');" tabindex="0"></span>
									<span data-input class="input-number" style="width: 28px; font-size: 12px; padding: 3px;" data-link="{serialize $task} => 'req_items', {@$idx}, 'amount'" data-placeholder="(0)"></span>
								</div>
							{/for}
							<span class="item" tabindex="0"><img src="{@ROOT_URL}img/item-add.jpg" onclick="{serialize $win}.item_add_onclick('req');"></span>
						</div>

						<div style="display: flex; align-items: baseline; column-gap: 10px;">
							<div style="margin-top: 5px;">Report to NPC: <a class="button menu-triangle" data-link-button="{serialize $task} => 'finish_npc'" data-select="db.npcs" oninput="{serialize $win}.update_npc('finish_npc', this);"></a></div>
							{if !$remove_premise_items}
								<label><input type="checkbox" class="checkbox" data-link="{serialize $task} => 'remove_premise_items'"><span>Remove Items from EQ</span></label>
								{assign remove_premise_items = true}
							{/if}
						</div>
					</div>

					<div>
						<div>Report to NPC: <a class="button menu-triangle" data-link-button="{serialize $task} => 'finish_npc'" data-select="db.npcs" oninput="{serialize $win}.update_npc('finish_npc', this);"></a></div>
					</div>

					<div class="flex-columns" style="flex-wrap: wrap; column-gap: 5px;">
						<span>Reach Location:</span>
						<span data-select="PWMap.maps_arr" data-link="{serialize $task} => 'reach_location_world_id'" style="width: auto; min-width: 100px; flex: 1;"></span>
						East:<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'reach_location', 'east'"></span>
						Bottom:<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'reach_location', 'bottom'"></span>
						South:<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'reach_location', 'south'"></span>
						West:<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'reach_location', 'west'"></span>
						Top:<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'reach_location', 'top'"></span>
						North:<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'reach_location', 'north'"></span>
					</div>

					<div>
						<div style="display: flex; column-gap: 5px; padding-top: 4px;">
							Wait (sec): <span data-input class="input-number" style="width: 38px; font-size: 12px; padding: 3px;" data-link="{serialize $task} => 'req_wait_time'" data-placeholder="(0)"></span>
						</div>
						<div style="margin-top: 5px;">Report to NPC: <a class="button menu-triangle" data-link-button="{serialize $task} => 'finish_npc'" data-select="db.npcs" oninput="{serialize $win}.update_npc('finish_npc', this);"></a></div>
					</div>
				</div>
			{/if}

			<div style="width: 100%;">
				<div style="margin-bottom: -5px; margin-left: -8px; margin-right: -8px">
					<div style="display: flex;">
						<span style="margin-left: 8px; margin-top: 4px; margin-right: 8px; font-weight: bold;">Dialogue:</span>
						<div class="tab_menu dialogue dialogue_tabs" style="width: 100%;">
							<div data-id="initial" onclick="{serialize $win}.select_tab('dialogue', 'initial');" style="{if $task.parent_quest || $task.start_by != 2}display: none;{/if}">Initial</div>
							<div data-id="notqualified" onclick="{serialize $win}.select_tab('dialogue', 'notqualified');" style="{if $task.parent_quest || $task.success_method == 3 || $task.success_method == 0}display: none;{/if}">Requirements not met</div>
							<div data-id="unfinished" onclick="{serialize $win}.select_tab('dialogue', 'unfinished');">In progress</div>
							<div data-id="ready" onclick="{serialize $win}.select_tab('dialogue', 'ready');" style="{if $task.sub_quests?.length}display: none;{/if}">Ready to finish</div>
							<div data-id="description" style="margin-left: auto;" onclick="{serialize $win}.select_tab('dialogue', 'description');">Description</div>
						</div>
					</div>
					<div class="dialogue_container">
						<div class="dialogue-diagram">
							<ul class="diagram" style="margin-bottom: -5px;">
								{if $win.sel_opts.dialogue == 'description'}
									<li class="description">
										<span class="pw-editable-color-text" style="flex: 1; margin-right: 5px; min-width: 275px;" data-editable-color-text data-link="{serialize $task} => 'briefing'"></span>
									</li>
								{/if}
								<li class="start"><span>NPC</span>
									{if $win.sel_opts.dialogue && $task.dialogue?.[$win.sel_opts.dialogue]?.questions?.filter(q => q.text || q.choices?.filter(c => c.id > 0)?.length)?.length}
										<ul>
											{@TaskWindow.print_question($task.id, $win.sel_opts.dialogue, $task.dialogue[$win.sel_opts.dialogue], TaskWindow.get_first_question($task.dialogue[$win.sel_opts.dialogue])?.id)}
										</ul>
									{/if}
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			<div class="flex-columns" style="flex-wrap: wrap; margin-top: 5px; align-items: baseline;">
				{if $task.parent_quest}
					<label><input type="checkbox" data-link="{serialize $task} => 'on_fail_parent_fail'" class="checkbox"><span>Fail parent on fail</label>
					<label><input type="checkbox" data-link="{serialize $task} => 'on_success_parent_success'" class="checkbox"><span>Succeed the parent on success</label>
				{/if}
				<label><input type="checkbox" data-link="{serialize $task} => 'can_give_up'" class="checkbox"><span>Can give up</label>
				<label><input type="checkbox" data-link="{serialize $task} => 'cant_retake_after_giving_up'" class="checkbox"><span>Can't be re-taken after giving up</label>
				<div class="flex-columns">
					<span>Time limit (sec): </span>
					<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'time_limit_sec'"></span>
				</div>
				<label><input type="checkbox" data-link="{serialize $task} => 'can_retake_after_failure'" class="checkbox"><span>Can be re-taken after failure</label>
			</div>

			<div id="free_given_items" class="data-field" style="align-items: center;">
				<span style="font-weight: bold;">Give Items on start: </span>
				{assign idx = -1}
				{for item of ($task.free_given_items || [])}
					{$idx++}
					{if !$item?.id}{continue}{/if}
					<div class="item-w-cnt">
						<span class="item" data-link-item="{serialize $task} => 'free_given_items', {@$idx}, 'id'" data-default-id="-1" oninput="{serialize $win}.cleanup_items('free_given');" tabindex="0"></span>
						<span data-input class="input-number" style="width: 28px; font-size: 12px; padding: 3px;" data-link="{serialize $task} => 'free_given_items', {@$idx}, 'amount'" data-placeholder="(0)"></span>
					</div>
				{/for}
				<span class="item" tabindex="0"><img src="{@ROOT_URL}img/item-add.jpg" onclick="{serialize $win}.item_add_onclick('free_given');"></span>
			</div>

			<div>
				<div class="flex-columns" style="flex-wrap: wrap; align-items: baseline;">
					<div style="font-weight: bold;">Awards:</div>
					<span data-select="TaskWindow.award_types" data-link="{serialize $task} => 'award_type'" style="width: auto; min-width: 100px;"></span>
					<div class="flex-columns">
						<span>XP:</span>
						<span data-input class="input-number" style="width: 42px;" data-link="{serialize $task} => 'award', 'xp'"></span>
					</div>
					<div class="flex-columns">
						<span>SP:</span>
						<span data-input class="input-number" style="width: 42px;" data-link="{serialize $task} => 'award', 'sp'"></span>
					</div>
					<div class="flex-columns">
						<span>Rep:</span>
						<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'award', 'rep'"></span>
					</div>
					<div class="flex-columns">
						<span>New quest:</span>
						<a class="button menu-triangle" data-link-button="{serialize $task} => 'award', 'new_quest'" data-select="db.tasks"></a>
					</div>
					<div class="flex-columns">
						<span>Trigger:</span>
						<a class="button menu-triangle" data-link-button="{serialize $task} => 'award', 'ai_trigger'" data-select="db['triggers_' + (g_map.maptype.id != 'none' ? g_map.maptype.id : 'gs01')]" style="margin-top: 1px; margin-bottom: 1px;"></a>
						<label title="Checked = enable trigger" style="margin-left: -5px; align-items: baseline;"><input type="checkbox" data-link="{serialize $task} => 'award', 'ai_trigger_enable'" class="checkbox"><span></span></label>
					</div>
					<div class="flex-columns">
						<span>Coins:</span>
						<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'award', 'coins'"></span>
					</div>

					<div class="data-field" style="align-items: unset;">
						<span>Items: </span>
						<span id="award_items_type" data-select="TaskWindow.award_item_types" data-onselect="{serialize $win}.select_award_item_type(id);" style="width: auto; min-width: 130px;" data-selected="{@$win.award_item_type}"></span>
						<div id="award_items" style="display: flex; flex-wrap: wrap; row-gap: 10px;">
							{if $win.award_item_type == 0 || $win.award_item_type == 1}
								<div style="display: flex; flex-direction: column; row-gap: 5px; padding-right: 4px;">
										<span>Num:</span>
										<span>%:</span>
								</div>

								{assign idx = -1}
								{for item of ($task.award?.item_groups?.[0]?.items || [])}
									{$idx++}
									{if !$item?.id}{continue}{/if}
									<div class="item-w-cnt" style="display: flex;">
										<span class="item" data-link-item="{serialize $task} => 'award', 'item_groups', 0, 'items', {@$idx}, 'id'" data-default-id="-1" oninput="{serialize $win}.cleanup_items('award');" tabindex="0"></span>
										<div style="display: flex; flex-direction: column; row-gap: 5px; padding: 0 4px;">
											<span data-input class="input-number" style="width: 28px; font-size: 12px; padding: 3px;" data-link="{serialize $task} => 'award', 'item_groups', 0, 'items', '{@$idx}', 'amount'" data-placeholder="(0)"></span>
											<span data-input class="input-number is_float" style="width: 28px; font-size: 12px; padding: 3px;" data-link="{serialize $task} => 'award', 'item_groups', 0, 'items', '{@$idx}', 'probability'" data-placeholder="(0)"></span>
										</div>
									</div>
								{/for}
								<span class="item" tabindex="0"><img src="{@ROOT_URL}img/item-add.jpg" onclick="{serialize $win}.item_add_onclick('award');"></span>

							{else if $win.award_item_type == 2}
								{assign group_idx = -1}
								<div class="award_item_rows">
									{for group of ($task.award?.item_groups || [])}
										<div class="data-field">
											{$group_idx++}
											<span>{@$group_idx + 1}.</span>
											{for idx = 0; idx < 4; idx++}
												<span class="item" data-link-item="{serialize $task} => 'award', 'item_groups', {@$group_idx}, 'items', {@$idx}, 'id'" data-default-id="0" oninput="{serialize $win}.fix_award_probability({@$group_idx});" tabindex="0"></span>
											{/for}
											<div style="flex: 1;"></div>
											<a class="remove-btn" onclick="{serialize $win}.remove_award_item_row({@$group_idx});"><i class="close fa fa-minus-circle"></i></a>
										</div>
									{/for}
								</div>
								<div class="add-container"><div style="flex: 1;"></div><a class="button add" style="margin-top: auto; margin-left: 8px;" onclick="{serialize $win}.add_award_item_row();">(add) <i class="fa fa-plus"></i></a></div>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<div style="padding: 0;">
				<div class="collapsible" onclick="HTMLSugar.collapse_el(this);">Extras:</div>
				<div class="flex-rows" style="">
					{if !$task.parent_quest}
						<div style="font-weight: bold;">Extra requirements:</div>
						<div class="flex-columns" style="flex-wrap: wrap;">
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
								<span>Min. faction rank</span>
								<span data-select="TaskWindow.faction_ranks" data-link="{serialize $task} => 'premise_faction_role'" style="width: auto; min-width: 75px;"></span>
							</div>
							<div class="data-field">
								<span>Gender</span>
								<span data-select="TaskWindow.genders" data-link="{serialize $task} => 'premise_gender'" style="width: auto; min-width: 75px;"></span>
							</div>
							<label><input type="checkbox" data-link="{serialize $task} => 'premise_be_married'" class="checkbox"><span>Must be Married</span></label>
							<label><input type="checkbox" data-link="{serialize $task} => 'premise_be_gm'" class="checkbox"><span>Must be a GM</span></label>
						</div>
					{/if}

					<div class="flex-columns" style="flex-wrap: wrap; margin-top: 8px; align-items: baseline;">
						<div style="font-weight: bold;">Extra options:</div>
						<div class="flex-columns">
							<span>Auto-start quest on failure:</span>
							<a class="button menu-triangle" data-link-button="{serialize $task} => 'failure_award', 'item_groups', 0, 'new_quest'" data-select="db.tasks"></a>
						</div>
						<div class="flex-columns">
							<span>Trigger on failure:</span>
							<a class="button menu-triangle" data-link-button="{serialize $task} => 'failure_award', 'ai_trigger'" data-select="db['triggers_' + (g_map.maptype.id != 'none' ? g_map.maptype.id : 'gs01')]" style="margin-top: 1px; margin-bottom: 1px;"></a>
							<label title="Checked = enable trigger" style="align-items: baseline; margin-left: -5px;"><input type="checkbox" data-link="{serialize $task} => 'failure_award', 'ai_trigger_enable'" class="checkbox"><span></span></label>
						</div>
						<div id="failure_award_items" class="data-field" style="align-items: unset;">
							<span>Give Items on failure: </span>
							<div style="display: flex; flex-wrap: wrap; row-gap: 10px;">
								{assign idx = -1}
								{for item of ($task.failure_award?.item_groups?.[0]?.items || [])}
									{$idx++}
									{if !$item?.id}{continue}{/if}
									<div class="item-w-cnt" style="display: flex;">
										<span class="item" data-link-item="{serialize $task} => 'failure_award', 'item_groups', 0, 'items', {@$idx}, 'id'" data-default-id="-1" oninput="{serialize $win}.cleanup_items('failure_award');" tabindex="0"></span>
										<div style="display: flex; flex-direction: column; row-gap: 5px; padding: 0 4px;">
											<span data-input class="input-number" style="width: 28px; font-size: 12px; padding: 3px;" data-link="{serialize $task} => 'failure_award', 'item_groups', 0, 'items', {@$idx}, 'amount'" data-placeholder="(0)"></span>
											<span data-input class="input-number is_float" style="width: 28px; font-size: 12px; padding: 3px;" data-link="{serialize $task} => 'failure_award', 'item_groups', 0, 'items', '{@$idx}', 'probability'" data-placeholder="(0)"></span>
										</div>

									</div>
								{/for}
								<span class="item" tabindex="0"><img src="{@ROOT_URL}img/item-add.jpg" onclick="{serialize $win}.item_add_onclick('failure_award');"></span>
							</div>
						</div>
						<div class="flex-columns">
							<span>Give Coins on failure:</span>
							<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'failure_award', 'coins'"></span>
						</div>
						{if !$task.parent_quest}
							<div class="flex-columns">
								<span>Simultaneous player limit:</span>
								<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'simultaneous_player_limit'"></span>
							</div>
							<label><input type="checkbox" data-link="{serialize $task} => 'cant_be_found'" class="checkbox"><span>Hide from "Find quest"</label>
						{/if}

						<label><input type="checkbox" data-link="{serialize $task} => 'no_display_quest_title'" class="checkbox"><span>Dont notify on receive/complete</label>
						<label><input type="checkbox" data-link="{serialize $task} => 'no_show_direction'" class="checkbox"><span>Hide navigation arrow</label>

						<div class="flex-columns">
							<span>Trigger on start:</span>
							<a class="button menu-triangle" data-link-button="{serialize $task} => 'ai_trigger'" data-select="db['triggers_' + (g_map.maptype.id != 'none' ? g_map.maptype.id : 'gs01')]" style="margin-top: 1px; margin-bottom: 1px;"></a>
							<label title="Checked = enable trigger" style="align-items: baseline; margin-left: -5px;"><input type="checkbox" data-link="{serialize $task} => 'ai_trigger_enable'" class="checkbox"><span></span></label>
						</div>
					</div>

					<div class="flex-columns" style="flex-wrap: wrap; margin-top: 8px;">
						<div style="font-weight: bold;">Extra awards:</div>
						<div class="flex-columns">
							<span>Expand inventory slots to:</span>
							<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'award', 'inventory_slots'"></span>
						</div>

						<div class="flex-columns">
							<span>Expand bank slots to:</span>
							<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'award', 'storage_slots'"></span>
						</div>

						<div class="flex-columns">
							<span>Expand pet bag slots to:</span>
							<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'award', 'petbag_slots'"></span>
						</div>

						<div class="flex-columns" style="column-gap: 5px;">
							<span>Teleport to:</span>
							<span data-select="PWMap.maps_arr" data-link="{serialize $task} => 'award', 'tp', 'world'" style="width: auto; min-width: 100px; flex: 1;"></span>
							X:<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'award', 'tp', 'x'"></span>
							Y:<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'award', 'tp', 'y'"></span>
							Z:<span data-input class="input-number" style="width: 30px;" data-link="{serialize $task} => 'award', 'tp', 'z'"></span>
						</div>
					</div>
					<div>
						<div>TODO: date spans, instant tp</div>
						<br>
					</div>
				</div>
			</div>
		</div>
		</div>
	</div>
</div>

{@@
<style>
.dialogue-diagram {
	background-color: #737373;
	border: 2px solid #2b2b2b;
	padding: 5px;
	position: relative;
	overflow-x: auto;
	overflow-y: auto;
	max-height: 70vh;
	cursor: all-scroll;
}

.dialogue-diagram span {
	cursor: text;
}

.dialogue_container {
	position: relative;
}

.dialogue_container:after {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: #000;
	opacity: 0.15;
	pointer-events: none;
	z-index: 10;
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
	align-items: center;
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
	display: table;
}
.diagram ul {
	max-width: 9999px;
	width: 100%;
	overflow: visible;
}

.diagram li {
	display: table-cell;
	padding: .5em 0;
	vertical-align: top;
	min-width: 50px;
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

.diagram li {
	pointer-events: none;
}

.diagram li > span {
	pointer-events: all;
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
	max-width: 350px;
}

.diagram li.start > span {
	background: #bdbdbd;
	color: black;
	cursor: default;
}

.diagram li.choice > span {
	background-color: #561010;
}

.diagram li.choice > span[data-option="true"] {
	padding-bottom: 33px;
	margin-bottom: -27px;
	border-bottom: none;
	min-width: 180px;
}

.diagram li.choice > span[data-option="true"]:after {
	content: '';
	position: absolute;
	bottom: 28px;
	left: 0;
	right: 0;
	height: 2px;
	background: #d9d9b9;
}

.diagram li.choice > br {
	user-select: none;
}

.diagram li.choice > span ~ span {
	border: none;
	border-radius: 0;
	padding: 2px;
	margin: 0;
	background-color: none;
	width: 180px;
	text-align: center;
	color: #ddd;
	user-select: none;
}

.diagram li.choice > span ~ span > input {
	display: inline-block;
	font-size: 9pt;
	font-weight: bold;
	padding: 2px 4px;
	width: 62px;
}

.diagram li.choice > span ~ span:before {
	content: none;
}

/* | */
.diagram ul:before,
.diagram li > span:before {
	outline: solid 1px #333;
	content: "";
	height: .4em;
	left: 50%;
	position: absolute;
}

.diagram ul:before {
	top: -.5em;
}

.diagram li > span:before {
	top: -.55em;
}

/* The root node doesn't connect upwards */
.diagram > li { margin-top: 0; }
.diagram > li:before,
.diagram > li:after,
.diagram > li > span:before {
outline: none;
}

.diagram code {
	border: none;
	overflow: hidden;
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
	display: none !important;
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
	margin-top: 3px;
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
	border-bottom: 3px solid #313131;
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
	overflow: hidden;
}

#scroll {
	overflow-x: hidden;
	overflow-y: scroll;
}

#body {
	flex: 1;
	display: flex;
	flex-wrap: wrap;
	column-gap: 5px;
	row-gap: 5px;
	padding: 5px;
	margin: -5px;
	margin-top: -2px;
	margin-right: 0;
	height: min-content;
}

#body > * {
	background-color: white;
	box-shadow: 0px 0px 2px 0px rgb(0 0 0 / 10%);
	padding: 5px 8px;
	flex-grow: 1;
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
	padding: 4px 6px;
}

#toptasks > .tasks > div {
	display: flex;
	column-gap: 5px;
}

#kill_monsters > div {
	display: flex;
	column-gap: 5px;
	align-items: center;
	height: 32px;
}

#kill_monsters > div.collect > :not(.collect):not(.always),
#kill_monsters > div:not(.collect) > .collect:not(.always) {
	display: none;
}

.item-w-cnt {
	font-size: 0;
	line-height: 0;
}

.item {
	cursor: pointer;
}

.remove-btn > i {
	color: #cc2020;
	font-size: 13pt;
	margin-left: 5px;
}

.remove-btn:hover > i {
	color: #a51a1a;
}

.award_item_rows {
	display: flex;
	flex-direction: column;
	row-gap: 3px;
}

label {
	height: auto;
}

label > input[type="checkbox"] {
	height: auto;
}


.flex-columns {
	align-items: baseline;
}
</style>
@@}
</script>


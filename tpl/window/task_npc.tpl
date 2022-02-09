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

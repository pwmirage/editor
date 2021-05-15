<script id="tpl-page-game_admin" type="text/x-dot-template">
<div class="mgContent" style="min-height: 276px;">
	<div class="left">
		<h1>Online Players ({@$online_p.length})</h1>
		<div class="players">
			{for player of $online_p}
				<div onclick="{serialize $page}.show_char_info({@$player.roleid});">
					<span class="name">{@$player.name} #{@$player.roleid}</span>
					<span class="fac">Fac: {@$player.fid || '(none)'}</span>
					<span class="ip">IP: unavailable</span>
				</div>
			{/for}
		</div>
	</div>

	<div style="display: flex; margin-top: 10px;">
		<div style="flex: 1;"></div>
		<a class="button buttonPrimary" href="javascript:void(0);" onclick="{serialize $page}.save();">Save</a>
	</div>
</div>

{@@
<style>
.mgContent {
	display: flex;
	flex-direction: column;
	row-gap: 4px;
	background-color: #f7f9fa;
	margin: -20px;
	padding: 20px;
}

h1 {
	font-size: 15pt;
}

.players {
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

.players > * {
	background-color: white;
	box-shadow: 0px 0px 2px 0px rgb(0 0 0 / 40%);
	padding: 5px 8px;
	display: flex;
	flex-direction: column;
	cursor: pointer;
}

.players .name {
	font-weight: bold;
}

.players .fac,
.players .ip {
	font-size: 8pt;
}

</style>
@@}
</script>

<script id="tpl-page-game_admin-char-info" type="text/x-dot-template">
<div id="background" onclick="{serialize $page}.close();">
<div class="modal" onclick="event.stopPropagation();">
	<div style="display: flex; flex-direction: column;">
		<h1 style="margin-top: 0;">Player: {@$p.base.name} Lv. {@$p.status.level} #{@$p.base.id}</h1>
		<span>Created: {@GameAdminCharPage.parse_date($p.base.create_time)}</span>
		<span>Last login: {@GameAdminCharPage.parse_date($p.base.lastlogin_time)}</span>
		<span>Total online time: {@GameAdminCharPage.parse_time_elapsed($p.status.time_used)}</span>
		<span>In world: #{@$p.status.worldtag}, pos: [{@Math.floor($p.status.posx)}, {@Math.floor($p.status.posy)}, {@Math.floor($p.status.posz)}]</span>
	</div>

	<a class="button buttonPrimary" style="position: absolute; right: 20px;" href="javascript:void(0);" onclick="{serialize $page}.close();">X</a>

	<div>
		<div>
			<h1>Equipped</h1>
			<div class="items equipped">
				{assign idx = -1}
				{for item of $p.equipment.slots}
					{$idx++}
					<span class="item" data-id="{@$item.id}" data-idx="{@$idx}" tabindex="0"><img{ } src="{@Item.get_icon_by_item(g_latest_db, $item.id)}" alt=""></span>
				{/for}
			</div>
		</div>

		<div style="display: flex; column-gap: 8px;">
			<div>
				<h1>Inventory</h1>
				<div>Money: {@$p.inventory.money}</div>
				<div class="items inventory">
					{assign assoc_inv = []}
					{$p.inventory.slots.forEach(i => $assoc_inv[i.pos] = i)}

					{for idx = 0; idx < $p.inventory.icapacity; idx++}
						{assign item = $assoc_inv[$idx]}
						<span class="item" data-id="{@$item?.id || 0}" data-idx="{@$idx}" tabindex="0"><img{ } src="{@Item.get_icon_by_item(g_latest_db, $item?.id || 0)}" alt=""></span>
					{/for}
				</div>
			</div>
			<div>
				<h1>Bank storage:</h1>
				<div>Money: {@$p.safe.money}</div>
				<div class="items safe">
					{assign assoc_inv = []}
					{$p.safe.slots.forEach(i => $assoc_inv[i.pos] = i)}

					{for idx = 0; idx < $p.safe.capacity; idx++}
						{assign item = $assoc_inv[$idx]}
						<span class="item" data-id="{@$item?.id || 0}" data-idx="{@$idx}" tabindex="0"><img{ } src="{@Item.get_icon_by_item(g_latest_db, $item?.id || 0)}" alt=""></span>
					{/for}
				</div>
			</div>
		</div>
	</div>

	<div>
		<h1>Tasks:</h1>
		<div>
			<h2>In progress:</h2>
			<div class="tasks">
				{assign d = $p.tasks.data}
				{assign count = $d[0]}
				{if $count * 32 + 8 != $d.length}
					Invalid task data
				{else}
					{assign depth = 0}
					{for idx = 0; idx < $count; idx++}
						{assign q_off = 8 + $idx * 32}
						{assign id = $d[$q_off + 0] | ($d[$q_off + 1] << 8)}
						{assign child_idx = $d[$q_off + 5]}
						{assign q = g_latest_db.tasks[$id]}
						<div>
							{for i = 0; i < $depth; i++}
								&nbsp; &nbsp; &nbsp;
							{/for}
							{@GameAdminCharPage.print_task_name($q?.name || '(unknown)')} #{@$id}
						</div>
						{if $child_idx != 0xff}
							{$depth++}
						{else}
							{$depth = 0}
						{/if}
					{/for}
				{/if}
			</div>

			<h2>Finished:</h2>
			<div class="tasks">
				{assign d = $p.tasks.complete}
				{assign count = $d[0] | ($d[1] << 8)}
				{if $count * 2 + 4 != $d.length}
					Invalid task data
				{else}
					{for idx = 0; idx < $count; idx++}
						{assign q_off = 4 + $idx * 2}
						{assign id = $d[$q_off + 0] | ($d[$q_off + 1] << 8)}
						{assign q = g_latest_db.tasks[$id]}
						<div>
							{@GameAdminCharPage.print_task_name($q?.name || '(unknown)')} #{@$id}
						</div>
					{/for}
				{/if}
			</div>

			<h2>Finished (repeatable quests):</h2>
			<div class="tasks">
				{assign d = $p.tasks.finishtime}
				{assign count = $d[0] | ($d[1] << 8)}
				{if $count * 6 + 2 != $d.length}
					Invalid task data
				{else}
					{for idx = 0; idx < $count; idx++}
						{assign q_off = 2 + $idx * 6}
						{assign id = $d[$q_off + 0] | ($d[$q_off + 1] << 8)}
						{assign q = g_latest_db.tasks[$id]}
						<div>
							{@GameAdminCharPage.print_task_name($q?.name || '(unknown)')} #{@$id}
						</div>
					{/for}
				{/if}
			</div>

		</div>
		<div>
			<h1>Task items:</h1>
			<div class="items taskitems">
				{assign idx = -1}
				{for item of $p.tasks.invslots}
					{$idx++}
					<span class="item" data-id="{@$item.id}" data-idx="{@$idx}" tabindex="0"><img{ } src="{@Item.get_icon_by_item(g_latest_db, $item.id)}" alt=""></span>
				{/for}
			</div>
		</div>
	</div>

	<div style="display: flex; margin-top: 10px;">
		<div style="flex: 1;"></div>
		<a class="button buttonPrimary" href="javascript:void(0);" onclick="{serialize $page}.close();">Close</a>
	</div>
</div>
<div class="modal-margin">
</div>
</div>

{@@
<style>
#background {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background-color: rgba(0, 0, 0, 0.4);
	overflow-y: auto;
	z-index: 100;
}

.modal {
	margin-left: 50%;
	margin-top: 40px;
	transform: translate(-50%, 0);
	display: flex;
	flex-direction: column;
	row-gap: 4px;
	background-color: #f7f9fa;
	background-color: #e4e4e4;
	padding: 20px;
	column-gap: 5px;
	row-gap: 5px;
}

.modal-margin {
	height: 40px;
}

h1 {
	font-size: 14pt;
}

h2 {
	font-size: 11pt;
	font-weight: bold;
}

.items {
	display: flex;
	flex-wrap: wrap;
	row-gap: 2px;
	column-gap: 2px;
	max-width: calc(34px * 8);
}

.tasks {
	position: relative;
	max-width: 500px;
	background-color: #626262;
	color: white;
	padding: 4px 3px;
	display: flex;
	flex-direction: column;
	row-gap: 3px;
}

.tasks:after {
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

.tasks > * {
	background-color: #313131;
	padding: 3px 5px;
}

</style>
@@}
</script>

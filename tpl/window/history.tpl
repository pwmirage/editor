<script id="tpl-history" type="text/x-dot-template">
<div class="window resizable" style="width: 800px; height: 600px;">
{assign project = db.metadata[1]}
<div class="header">
	<span>Project: XYZ #{@$project.pid}</span>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="maximize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows" style="overflow: hidden;">
	<div class="flex-columns tabs" style="margin-bottom: 8px;">
		<div class="tab" onclick="{serialize $win}.select_tab(0);">Base</div>
		<div class="tab" onclick="{serialize $win}.select_tab(1);">History</div>
		<div class="tab" onclick="{serialize $win}.select_tab(2);">Changes</div>
	</div>

	<div class="tabcontents">
		<div id="base"></div>
		<div id="history" class="history">
			{for gen of db.changelog}{for diff of $gen}
				{assign obj = diff._db.obj}
				{assign type = $obj._db.type}
				{if $type == 'npc_sells'}
					<div class="collapsible" onclick="{serialize $win}.collapse(this);">
						<span>NPC Goods {@serialize_db_id($obj.id)} {@$win.used_by($obj)}</span>
					</div>
					<div>
						{if $diff.name}
							<div class="block">
								{assign prev = $win.find_previous(diff, (d) => d.name)}
								<span class="header">Name</span>
								<span class="minus">{@$prev.name}</span>
								<span class="plus">{@$diff.name}</span>
							</div>
						{/if}
						{for i = 0; i < 8; i++}
							{if !$diff.pages}{break}{/if}
							{if !$diff.pages[$i]}{continue}{/if}
							{assign pageid = $i}
							{assign page = diff.pages[$i]}
							<div class="block">
								<span class="header">Tab "{@$page.title || '(unnamed)'}" #{@$i}</span>
								{if $page.title}
									<div class="block">
										{assign prev = $win.find_previous(diff, (d) => d.pages && d.pages[$i]?.title)}
										<span class="header">Name</span>
										<span class="minus">{@$prev.pages[$i].title}</span>
										<span class="plus">{@$page.title}</span>
									</div>
								{/if}
								{assign rows = new Set()}
								{for p_item_id in ($page.item_id || \{\})}
									{assign rowid = Math.floor($p_item_id / 8)}
									{$rows.add($rowid)}
								{/for}
								{if $rows.size}
									{assign prev_arr = $win.filter_previous(diff, (d) => d.pages && d.pages[$pageid]?.item_id)}
									{assign get_item_id = (id) => \{ const obj = $prev_arr.find((d) => d.pages?.[$pageid]?.item_id?.[id]); if (obj) return obj.pages[$pageid].item_id[id]; return 0; \}}
								{/if}
								{for rowid of $rows}
									<div class="block">
										<span class="header">Row {@$rowid}</span>
										<div class="goods">
										<div class="flex-rows" style="gap: 2px;">
											<span class="minus"></span>
											<span class="plus"></span>
										</div>
										{for i = 0; i < 8; i++}
											{assign prev_id = $get_item_id($rowid * 8 + $i)}
											{assign cur_id = $page.item_id[$rowid * 8 + $i] ?? $prev_id}
											<div class="flex-rows" style="gap: 2px;" onmousemove="{serialize $win}.onmousemove(event);" onmouseleave="this.onmousemove(event);">
												<span class="item {if $prev_id == $cur_id}unchanged{/if}" data-id="{@$prev_id}"><img{ } src="{@$win.get_item($prev_id)}" alt=""></span>
												<span class="item {if $prev_id == $cur_id}unchanged{/if}" data-id="{@$cur_id}"><img{ } src="{@$win.get_item($cur_id)}" alt=""></span>
											</div>
										{/for}
										</div>
									</div>
								{/for}
							</div>
						{/for}
					</div>
				{else}
					<span>{@$diff._db.obj._db.type}</span>
				{/if}
			{/for}{/for}
		</div>
		<div id="changes" class="changes"></div>
	</div>
</div>
</div>

{@@
<style>
.tabs {
	border-bottom: 1px solid #e0b0b0;
	margin: 0 -6px;
	padding: 0 6px;
}

.tabs > .tab {
	background-color: #dddddd;
	padding: 4px 10px;
	vertical-align: baseline;
	border: 1px solid #e0b0b0;
	margin-bottom: -1px;
	cursor: pointer;
}

.tabs > .tab.active {
	background-color: #fafafa;
	border-bottom: 1px solid #fafafa;
}

.tabcontents > * {
	display: none;
}

.tabcontents > .active {
	display: block;
}

.history {
	overflow-y: auto;
	overflow-x: hidden;
	height: auto;
	font-size: 13px;
	line-height: 15px;
}

.collapsible {
	padding: 4px 4px;
}

.collapsible:hover {
    background-color: #dadada;
}

.collapsible + * {
	padding: 0;
}

.block {
	display: flex;
	flex-direction: column;
	padding: 4px 5px;
	background-color: rgba(0, 0, 0, 0.05);
}

.block > * {
	margin-left: 6px;
}

.block > .header {
	margin-left: 3px;
	font-weight: bold;
}

.plus:before,
.minus:before {
	content: '+';
	display: inline-block;
	width: 10px;
	font-weight: bold;
	color: green;
}

.minus:before {
	content: '-';
	color: red;
}

.minus {
	color: #9e9e9e;
}

.goods {
	display: flex;
	flex-direction: columns;
	gap: 2px;
}

.goods .item,
.goods .item > img,
.goods .minus,
.goods .plus {
	width: 22px;
	height: 22px;
}

.goods .minus,
.goods .plus {
	line-height: 24px;
	width: auto;
}

.item {
	position: relative;
}

.item.unchanged:after {
	content: ' ';
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background-color: #fff;
	opacity: 0.45;
}
</style>
@@}

</script>

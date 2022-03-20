<div class="mgContent" style="min-height: 576px;">
	<div>Send Mail:</div>
	<input type="text" name="name" value="" style="flex: 1;" autocomplete="off" value="Gift from GM!">
	<textarea id="mail" style="margin-top: 8px; height: 300px;">Enjoy!</textarea>

	<div>
		<div>
			<span class="item" data-link-item="{serialize $db.metadata[1]} => 'dummy_item_id'" data-default-id="-1" tabindex="0"></span>
			<span data-input class="input-number" style="width: 28px; font-size: 12px; padding: 3px;" data-placeholder="(0)"></span>
		</div>

		<div class="flex-columns" style="flex-wrap: wrap; column-gap: 10px; justify-content: space-between; margin-top: 3px;">
			{for proc of Item.proc_types}
				{if $proc.mask & 0x80000000}
					<span style="">{@$proc.name}: <span data-input class="input-number" oninput="{serialize $win}.set_proc({@$proc.id}, this);">{@($item.proc_type >> 20) * 300}</span></span>
				{else}
					<label><input type="checkbox" class="checkbox" {if $item.proc_type & $proc.mask}checked{/if} oninput="{serialize $win}.set_proc({@$proc.id}, this);"><span>{@$proc.name}</span></label>
				{/if}
			{/for}
		</div>
	</div>

	<div style="float: right; margin-top: 8px;">
		<a class="button" href="javascript:void(0);" onclick="{serialize $page}.bump_generation();">Force fresh update</a>
		<a class="button" href="javascript:void(0);" onclick="{serialize $page}.set_motd();" style="margin-left: 8px;">Update MOTD Only</a>
		<a class="button" href="javascript:void(0);" onclick="{serialize $page}.publish();" style="margin-left: 8px;">Release!</a>
	</div>

</div>

{@@
<style>
a.button.branchname {
	position: relative;
	overflow: hidden;
	color: black;
	vertical-align: middle;
	width: 200px;
}

a.button.branchname:hover:after {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background: #000;
	opacity: 0.1;
}

.mgContent h2 {
	font-size: 15px;
	font-weight: bold;
}

.mgContent .fa-button {
	cursor: pointer;
}

.mgContent .projects .fa-button {
	font-size: 17px;
	line-height: 6px;
	margin-right: 6px;
	margin-left: -4px;
}

.table.projects {
	border-collapse: collapse;
}

.table.projects td, .table.projects th {
	border: 1px solid #ddd;
	padding: 8px;
}

.table.projects tr:nth-child(even){ background-color: #f2f2f2; }
.table.projects tr:hover { background-color: #ddd; }

.table.projects th {
	padding-top: 12px;
	padding-bottom: 12px;
	text-align: left;
	background-color: #843534;
	color: white;
}


.mgContent .branch-head > td {
	background-color: #e2e0e0;
}

.mgContent .branch-head:hover > td {
	background-color: #cecccc;
}

.mgContent .project-removed {
	text-decoration: line-through;
}

</style>
@@}

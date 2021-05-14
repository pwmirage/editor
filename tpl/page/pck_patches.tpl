<script id="tpl-pck-patches" type="text/x-dot-template">
<div class="mgContent" style="min-height: 276px;">
	<a class="button buttonPrimary" style="margin-left: auto; margin-top: 4px;" href="javascript:void(0);" onclick="{serialize $page}.new_patch();">New patch</a>

	<table id="patches">
		{assign branch_labels = []}
		{assign next_branch_labels = []}
		<tr>
			<th>ID</th>
			<th>PCK</th>
			<th>Patch Name</th>
			<th>Description</th>
			<th>URL</th>
			<th colspan="2">Size</th>
		</tr>
		{for patch of $patches}
			{assign branch_tr_printed = false}
			{for branch of $branches}
				{if (!$branch_labels[$branch.id] && $branch.head_pck_patch_id >= $patch.ID) ||
						(!$next_branch_labels[$branch.id] && !$branch_labels[$branch.id] && $branch.next_pck_patch_id >= $patch.ID)}
					{if !$branch_tr_printed}
						<tr><td colspan="7"><div class="branch_labels">
					{/if}

					{if $branch.head_pck_patch_id >= $patch.ID}
						<span class="branch_label" style="background: {@$page.branch_colors[$branch.id]}; cursor: help;" title="This branch contains patches from this point forward">{@$branch.name}</span>
						{assign branch_labels[$branch.id] = 1}
					{else}
						<span class="branch_label next" style="background: {@$page.branch_colors[$branch.id]}; cursor: help;" title="This branch will contain patches from this point forward after the next publish">pending: {@$branch.name}</span>
						{assign next_branch_labels[$branch.id] = 1}
					{/if}

					{assign branch_tr_printed = true}
				{/if}
			{/for}
			{if $branch_tr_printed}
				</div></td></tr>
			{/if}
			<tr>
				<td>{@$patch.ID}</td>
				<td>{@$patch.pck}</td>
				<td>{@$patch.name}</td>
				<td>{@$patch.description}</td>
				<td><a href="{@$patch.url}"><i class="fa fa-external-link"></i></a></td>
				<td>{@$page.print_size($patch.fsize)}</td>
				<td><a class="button" href="javascript:void(0);" onclick="{serialize $page}.remove_patch({@$patch.ID});" style="padding: 2px 10px;"><i class="fa fa-times"></i></a>
				</td>
			</tr>
		{/for}
	</table>

	<a class="button buttonPrimary" style="margin-left: auto; margin-top: 4px;" href="javascript:void(0);" onclick="{serialize $page}.new_patch();">New patch</a>

	<div id="new_patch_dialogue" style="display: none;">
		<div style="display: flex; align-items: baseline;">
			<div style="width: 45px;">PCK</div>
			<select name="pck" style="flex: 1;">
				<option value="" selected></option>
				{for f of $page.pck_filenames}
					<option value="{@$f}.pck">{@$f}.pck</option>
				{/for}
			</select>
		</div>

		<div style="display: flex; align-items: baseline; margin-top: 4px;">
			<div style="width: 45px;">Name</div>
			<input type="text" name="name" value="" style="flex: 1;" autocomplete="off">
		</div>

		<div style="margin-top: 6px;">Description</div>
		<textarea name="description" style="height: 100px;"></textarea>

		<div class="file_drop" style="margin-top: 12px;" ondrop="{serialize $page}.on_file_drop(event);" ondragover="{serialize $page}.on_file_drag(event);">
			<input type="file" name="file" style="display: none;">
			{if $file}
				<p style="margin: auto;">
					<button onclick="{serialize $page}.select_file();" style="text-transform: none;">{@$file.name}</button>
					<button class="buttonPrimary" style="margin-left: 6px;" onclick="{serialize $page}.on_file_clear();">X</button>
				</p>
			{else}
				<p><button onclick="{serialize $page}.select_file();">Select file</button> &nbsp;&nbsp; or drag it into this zone</p>
			{/if}
		</div>
		{@@
		<style>
			.file_drop {
				cursor: pointer;
				padding: 13px;
				border: 2px dashed grey;
				display: flex;
			}
		</style>
		@@}
	</div>
</div>

{@@
<style>
#patches {
	border-collapse: collapse;
}

#patches td, #patches th {
	border: 1px solid #ddd;
	padding: 8px;
}

#patches tr:nth-child(even){ background-color: #f2f2f2; }
#patches tr:hover { background-color: #ddd; }

#patches th {
	padding-top: 12px;
	padding-bottom: 12px;
	text-align: left;
	background-color: #843534;
	color: white;
}

.branch_labels {
	display: flex;
	column-gap: 5px;
}

.branch_label {
	position: relative;
	padding: 2px 4px;
	border-radius: 3px;
	overflow: hidden;
}

.branch_label.next {
	border: 1px dashed grey;
}

.branch_label.next:after {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background: #fff;
	opacity: 0.3;
}

.mgContent {
	display: flex;
	flex-direction: column;
	row-gap: 4px;
}

</style>
@@}
</script>

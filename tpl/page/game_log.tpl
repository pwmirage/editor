<div style="min-height: 276px;">
	<div style="display: flex; align-items: baseline; margin-top: 4px;">
		<div style="width: 45px;">Name</div>
		<input type="text" name="name" value="{@$patchfile.name}" disabled style="flex: 1;" autocomplete="off">
	</div>
	<div id="files">
		<table class="files">
			<tr>
				<th>Name</th>
				<th style="width: 186px;">Edit time</th>
				<th style="width: 35px; position: relative;">
					<a class="button" style="position: absolute; right: 0; top: 3px; padding: 5px 10px;" href="javascript:void(0);" onclick="{serialize $page}.refresh_files();"><i class="fa fa-refresh"></i></a>
				</th>
			</tr>

			{for file of $page.files}
				{if $file.name.endsWith('.imap')}
					{continue}
				{/if}
				<tr>
					<td>
						<a href="{@$file.url}" class="externalURL">
							{@$file.name}
						</a>
					</td>
					<td>
						<div data-datetime="{@$file.edit_time}"></div>
					</a>
					<td><button onclick="{serialize $page}.update_file({@$file.id}); event.stopPropagation();">Update</button></td>
				</tr>
			{/for}
		</table>

		<div style="display: flex; flex-direction: column; margin-top: 30px; row-gap: 10px;">
			<div style="display: flex; column-gap: 10px;">
				<h2 style="font-size: 17px;">Update branch</h2>
				<select oninput="{serialize $page}.select_branch(this.value)" name="pck">
					{for branch of $page.branches}
						<option value="{@$branch.id}" {if $branch == $page.selected_branch}selected{/if}>{@$branch.name}</option>
					{/for}
				</select>
			</div>

			<div id="branch" style="display: flex; flex-direction: column; row-gap: 3px;">
				{for file of $page.files}
					{if $file.name.endsWith('.imap')}
						{continue}
					{/if}

					{assign bfile = $page.selected_branch.files.find(f => f.name == file.name)}
					{if $bfile && $bfile.sha256 == $file.sha256}
						{continue}
					{/if}
					<div>
						<button onclick="{serialize $page}.update_branch_file({@$file.id}); event.stopPropagation();" >{@$file.name} &nbsp;<i class="fa fa-external-link"></i></button>
					</div>
				{/for}
			</div>

			{console.log(JSON.stringify($page.files, null))}
		</div>
	</div>

	<div style="display: flex; margin-top: 10px;">
		<a class="button buttonPrimary" href="javascript:void(0);" onclick="{serialize $page}.save();">Publish changes</a>
	</div>

	<div id="file_upload_dialogue" style="display: none;">
		{if $patchfile}
		<div style="width: 45px;">Name</div>
		<div style="display: flex; align-items: baseline; margin-top: 4px;">
			<input type="text" name="name" value="{@$patchfile.name}" disabled style="flex: 1;" autocomplete="off">
		</div>

		<div style="margin-top: 10px;">URL</div>
		<div style="display: flex; align-items: baseline; margin-top: 4px;">
			<input type="text" name="url" value="{@$patchfile.url}" style="flex: 1;" autocomplete="off">
		</div>

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
		{/if}
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
.mgContent {
	display: flex;
	flex-direction: column;
	row-gap: 4px;

}

.files {
	border-collapse: collapse;
	width: 100%;
}

.files td, .files th {
	padding: 8px;
	border: none;
}

.files tr:not(:first-child):not(:last-child) { border-bottom: 1px solid #ddd; }
.files tr:not(:first-child):not(.loading):hover {
	background-color: #ddd;
	cursor: pointer;
}

.files th {
	padding-bottom: 20px;
	text-align: left;
}

</style>
@@}

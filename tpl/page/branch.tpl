<script id="tpl-page-branch" type="text/x-dot-template">
<div class="mgContent" style="min-height: 576px;">
	<div style="display: flex; align-items: baseline; column-gap: 10px;">
		{assign branch = $page.selected_branch}
		<span>Branch: <a class="button branchname" style="background: {@$page.branch_colors[$branch.id]};">{@$branch.name}</a></span>
		{assign base = $branch.history.find(c => c.id)}
		<span>Base: <a href="{@'/editor/?id=' + $base?.id}">{@$base?.name || 'none'}</a></span>

		<span style="flex: 1;"></span>
		<span style="display: flex; column-gap: 3px; align-items: baseline;">
			<span>Pull changes from</span>
			<select class="pull_branch">
				{for branch of $branches}
					{if $branch == $page.selected_branch}{continue}{/if}
					<option value="{@$branch.id}" {if $page.selected_branch == $branch}selected="true"{/if}>{@$branch.id}. {@$branch.name.charAt(0).toUpperCase() + $branch.name.substring(1)} ({@$branch.history[0]?.id})</option>
				{/for}
			</select>
			<a class="button" href="javascript:void(0);" onclick="{serialize $page}.sync_branches(parseInt({serialize $page}.shadow.querySelector('.pull_branch').value), {serialize $page.selected_branch.id});">Pull</a>
		</span>

	</div>

	<div style="display: flex; column-gap: 15px; margin-top: 16px;">
		<div class="left">
			<h2 style="margin-top: 0px;">History:</h2>

			<table class="table projects" style="margin-top: 8px; width: 250px;">
				<tbody>
					{for project of $page.selected_branch.history}
						{assign is_head = $project.commit_id == $page.selected_branch.head_id}
						<tr class="{if $is_head}branch-head{/if} {if $project.is_removed || $project.is_being_removed}project-removed{/if}">
							<td style="width: 65px;" title="c {@$project.commit_id}">{@$project.id || '-'}</td>
							{if $project.pck_patch_id}
								<td title="c {@$project.commit_id}"><a href="javascript:void(0);"><u style="color: #77002c; font-weight: bold;">File:</u> {@$project.name}</a></td>
							{else}
								<td title="c {@$project.commit_id}"><a href="{@'/editor/?id=' + $project.id}">{@$project.name}</a></td>
							{/if}
							{if !$project.is_removed && !$project.is_being_removed && !$project.removed_id}
								<td style="cursor: pointer;" onclick="{serialize $page}.unmerge({@$project.id});"><i class="fa fa-close"></i>
							{else}
								<td></td>
							{/if}
						</tr>
					{/for}
				</tbody>
			</table>
		</div>

		<div class="right" style="flex: 1;">

			<h2 style="margin-top: 0px;">PCK Patches to merge:</h2>

			<table class="table projects" style="margin-top: 8px;">
				<tbody>
					<tr>
						<th style="width: 65px;">ID</th>
						<th style="width: 85px;">PCK</th>
						<th>Name</th>
						<th>Description</th>
						<th style="width: 120px;">Action</th>
					</tr>
					{assign patches_cnt = 0}
					{for patch of $patches}
						{if !$patch.can_be_merged}
							{continue}
						{/if}
						<tr>
							<td>{@$patch.ID}</td>
							<td>{@$patch.pck}</td>
							<td>{@$patch.name}</td>
							<td>{@$patch.description}</td>
							<td>
								<a class="button" href="javascript:void(0);" onclick="{serialize $page}.merge_pck_patch({@$patch.ID});"><i class="fa fa-plug fa-button" title="Merge"></i>Merge</a>
							</td>
						</tr>
						{$patches_cnt++}
					{/for}
					{if $patches_cnt == 0}
						<tr>
							<td colspan="5">No patches</td>
						</tr>
					{/if}
				</tbody>
			</table>

			<h2 style="margin-top: 40px;">Projects to merge:</h2>

			<table class="table projects" style="margin-top: 8px;">
				<tbody>
					<tr>
						<th style="width: 65px;">ID</th>
						<th>Name</th>
						<th style="width: 65px;">Base</th>
						<th style="width: 140px;">Last edit</th>
						<th style="width: 225px;">Action</th>
					</tr>
					{for project of $mergables}
						<tr>
							<td>{@$project.id}</td>
							<td><a href="{@'/editor/?id=' + $project.id}">{@$project.name}</a></td>
							<td>
								<a href="{@'/editor/?id=' + $project.base_id}" title="{@$project.base_name || 'None'}">
									{if $project.can_be_merged}
										<i class="fa fa-check" style="color: green;"></i>
									{else}
										<i class="fa fa-close" style="color: red;"></i>
									{/if}
								</a>
							</td>
							{assign date = new Date($project.edit_time * 1000)}
							<td>{@$date.toLocaleDateString("en-US", \{ year: 'numeric', month: 'long', day: 'numeric' \})}<br>{@$date.toLocaleTimeString("en-US")}</td>
							<td>
								<a class="button" href="javascript:void(0);" onclick="{serialize $page}.merge({@$project.id}, {@$project.revision});"><i class="fa fa-plug fa-button" title="Merge"></i>Merge</a>
								<a class="button" href="javascript:void(0);" onclick="{serialize $page}.defer({@$project.id}, true);" style="margin-left: 8px;"><i class="fa fa-history fa-button" title="Defer"></i>Defer</a>
							</td>
						</tr>
					{/for}
					{if $mergables.length == 0}
						<tr>
							<td colspan="5">No projects</td>
						</tr>
					{/if}
				</tbody>
			</table>

			<h2 style="margin-top: 40px;">Deferred projects:</h2>

			<table class="table projects" style="margin-top: 8px;">
				<tbody>
					<tr>
						<th style="width: 65px;">ID</th>
						<th>Name</th>
						<th style="width: 65px;">Base</th>
						<th style="width: 140px;">Last edit</th>
						<th style="width: 225px;">Action</th>
					</tr>
					{for project of $deferred}
						{if $project.base_commit_id && $project.base_branch_id != $page.selected_branch.id}
							{continue}
						{/if}
						<tr>
							<td style="width: 65px;">{@$project.id}</td>
							<td><a href="{@'/editor/?id=' + $project.id}">{@$project.name}</a></td>
							{assign date = new Date($project.edit_time * 1000)}
							<td style="width: 200px;">{@$date.toLocaleDateString("en-US", \{ year: 'numeric', month: 'long', day: 'numeric' \})}<br>{@$date.toLocaleTimeString("en-US")}</td>
							<td style="width: 250px;">
								<a class="button" href="javascript:void(0);" onclick="{serialize $page}.merge({@$project.id}, {@$project.revision});"><i class="fa fa-plug fa-button" title="Merge"></i>Merge</a>
								<a class="button" href="javascript:void(0);" onclick="{serialize $page}.defer({@$project.id}, false);" style="margin-left: 8px;"><i class="fa fa-history fa-button" title="Un-Defer"></i>Un-Defer</a>
							</td>
						</tr>
					{/for}
					{if $deferred.length == 0}
						<tr>
							<td colspan="5">No projects</td>
						</tr>
					{/if}
				</tbody>
			</table>

			<div style="font-size: 28px; font-weight: 300; margin-top: 28px;">Publish</div>

			<div>Message of the Day:</div>
			<textarea id="motd" style="margin-top: 8px; height: 300px;">{@$page.selected_branch.motd || ''}</textarea>

			<div style="float: right; margin-top: 8px;">
				<a class="button" href="javascript:void(0);" onclick="{serialize $page}.bump_generation();">Force fresh update</a>
				<a class="button" href="javascript:void(0);" onclick="{serialize $page}.set_motd();" style="margin-left: 8px;">Update MOTD Only</a>
				<a class="button" href="javascript:void(0);" onclick="{serialize $page}.publish();" style="margin-left: 8px;">Release!</a>
			</div>

		</div>
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
</script>

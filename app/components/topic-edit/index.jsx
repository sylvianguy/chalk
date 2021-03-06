import React from 'react';
import { Link , History } from 'react-router';
import Topic from '../topic/index.jsx';
import CopyToClipboard from 'react-copy-to-clipboard';
import Dropzone from 'react-dropzone';
import AuthMixin from '../../services/authMixin.jsx';
import topicData from '../../services/topic.jsx';
import TabMixin from '../../services/tabMixin.jsx';
import media from '../../services/media.jsx';
import NotificationSystem from 'react-notification-system';
import Loading from '../loading/index.jsx';

export default React.createClass({
	_notificationSystem: null,
	displayName: 'EditTopics',
	mixins:[AuthMixin,History, TabMixin],
	getInitialState(){
		return {
			topic: [],
			files: [],
			loading: false,
			copied: false,
			category: 'HTML & CSS'
		}
	},
	componentDidMount() {
		this._notificationSystem = this.refs.notificationSystem;
	},
	componentWillMount(){
		topicData.getTopicById(this.props.params.topicId).then(data => {
			this.setState({
				topic: data.topic
			});
		});
	},
	onDrop(files){
		this.setState({
			loading: true
		});

		files = files.map((file) => {
			return media.uploadFile(file);
		});


		$.when(...files)
			.then((...fileData) => {
				let files = [];
				// This lines deals with the fact that a single promise will return an array 
				// like this [Object, 'Succes', Object], so we just grab the first Object
				// since that is the data we want.

				if(typeof fileData[1] === 'string' ) {
					files = [fileData[0]];
				}
				else {
					files = fileData.map((file) => file[0]);
				}

				files = files.map((file) => file.media);

				this.setState({
					files: this.state.files.concat(...files),
					loading: false
				});
			}, (err) => { 
				this.__successNotification({
					message: 'Failed to upload files',
					title: 'Media',
					level: 'error'
				});
			});
	},
	_successNotification: function(messageObj) {
		this._notificationSystem.addNotification({
			message: messageObj.message,
			level: messageObj.level === 'error' ? 'error' : 'success',
			dismissible: false,
			title: messageObj.title
		});
	},
	editTopic(e) {
		e.preventDefault();
		topicData.updateTopic( this.state.topic._id, {
			title: this.refs.name.value,
			category: this.refs.category.value,
			description: this.refs.description.value,
			body : this.refs.body.value,
			time: this.refs.time.value
		}).then(res => {
			this._successNotification({
				title: 'Topic',
				message: 'Saved Successfully'
			});
		});
	},
	deleteTopic(e){
		e.preventDefault();
		let deleteConfirm = confirm('Are you sure you want to delete this topic?');
		if(deleteConfirm) {
			topicData.deleteTopic(this.state.topic._id).then(res =>{
				this.history.pushState(null, `/topics`);
			});
		}
	},
	handleChange(e){
		let stateObj = this.state.topic;
		stateObj[e.target.id] = e.target.value;
		this.setState({
			topic: stateObj
		});
	},
	copy() {
		this._successNotification({
			title: 'Media',
			message: 'Successfully copied'
		});
		this.setState({copied: true});
	},
	goBack() {
		this.history.goBack();
	},
	render() {
		let savedText = (
			<p><small>Saved</small></p>
		);
		return (
			<div>
				<NotificationSystem ref="notificationSystem" style={false}/>
				<div className="container">
					<header className="topContent">
						<button className="primary" onClick={this.goBack}><i className="chalk-home"></i>Go Back</button>
						<button onClick={this.deleteTopic} className="error"><i className="chalk-remove"></i>delete topic</button>
					</header>
				</div>
				<form action="" onSubmit={this.editTopic} >
					<section className="full topicsEdit">
						<div className="card topicRow">
							<div className="fieldRow">
								<label htmlFor="name" className="inline">Name</label>
								<input type="text" placeholder="Topic Name" value={this.state.topic.title} onChange={this.handleChange} id="title" ref="name" className="topicLong"/>
							</div>
							<div className="fieldRow">
								<label htmlFor="category" className="inline">Category</label>
								<select name="category" id="category" onChange={this.handleChange}ref="category" value={this.state.topic.category}>
									<option value="html">HTML</option>
									<option value="css">CSS</option>
									<option value="javascript">JavaScript</option>
									<option value="git">Git</option>
									<option value="wordpress">WordPress</option>
									<option value="wordpress-pt">Part Time - WordPress</option>
									<option value="tools">Tools</option>
									<option value="project">Project</option>
									<option value="resource">Resource</option>
									<option value="ux">UX</option>
									<option value="seo">SEO</option>
								</select>
								<label htmlFor="time" className="inline">Time</label>
								<input id="time" onChange={this.handleChange} value={this.state.topic.time} ref="time" type="text" placeholder="enter a number in minutes"/>
							</div>
							<div className="fieldRow">
								<label htmlFor="objective" className="inline">Topic Objective</label>
								<input ref="description" id="description" onChange={this.handleChange} type="text" value={this.state.topic.description} placeholder="Enter the key learning outcome associated with this topic" className="topicLong"/>
							</div>
							<button className="success">Save Topic</button>
							<Link className="linkBtn" to="topics">
								<button className="error">Cancel</button>
							</Link>
						</div>
						<div className="card topicRow">
							<textarea className="markdown" onKeyDown={TabMixin.keyHandler} value={this.state.topic.body} ref="body" name="" id="body" onChange={this.handleChange}>
							</textarea>
							<h3>Media</h3>

							<Dropzone onDrop={this.onDrop} className="dropZone">
								<p>Drag and drop files here or click to select files to upload</p>
							</Dropzone>
							<ul className="uploadedFiles">{this.state.files.map((file, index) =>
								<li key={index} className="mediaRow">
									<p className="mediaIcon"><i className="chalk-doc"></i>{file.name}</p>
									<div className="mediaLink">
										<input type="text" defaultValue={file.path}/>
										<CopyToClipboard text={file.path} onCopy={this.copy}>
											<div className="button success mediaCopy"><i className="chalk-copy"></i></div>
										</CopyToClipboard>
									</div>
								</li>
							)}</ul>
							<button className="success">Save Topic</button>
							<Link className="linkBtn" to="topics">
								<button className="error">Cancel</button>
							</Link>
						</div>
					</section>
				</form>
				<Loading loading={this.state.loading} loadingText='Uploading file' />
			</div>
			)
}
});

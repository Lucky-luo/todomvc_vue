(function (window,Vue,undefined) {
	new Vue({
		el: '#app',
		data: {
			// 当数组发生改变就再次存储回 localStorage 里面
			dataList:JSON.parse(window.localStorage.getItem('dataList')) || [],
			newTodo:'',
			showArr: [],
			beforeUpdate:{},
			activeBtn:1
		},
		methods: {
			// 添加一条数据
			addTodo() {
				if(!this.newTodo.trim()) {
					return;
				}
				this.dataList.push({
					content: this.newTodo.trim(),
					isFinish: false,
					id: this.dataList.length?this.dataList.sort((a,b)=>{return a.id-b.id})[this.dataList.length-1]['id']+1:1
				});
				this.newTodo = '';
			},
			// 删除一条数据
			delTodo(index) {
				this.dataList.splice(index,1);
			},
			// 删除所有数据
			delAll() {
				this.dataList = this.dataList.filter(item => !item.isFinish);
			},
			// 显示编辑文本框
			showEdit(index) {
				// 遍历，双击时，让所有的li 取消editing类名
				this.$refs.show.forEach(item=>{
					item.classList.remove('editing');
				});
				// 给此刻双击的加上类名editing
				this.$refs.show[index].classList.add('editing')
				// 在编辑之前拷贝一份内容出来
				this.beforeUpdate = JSON.parse(JSON.stringify(this.dataList[index]));
			},
			// 真正的编辑
			updateTodo(index) {
				// 判断是否为空，不为空根据index去删除
				if(!this.dataList[index].content.trim()) return this.dataList.splice(index,1);
				// 判断数组中选中的内容与预备的数组的内容是否不相等，不想等就是已改变，就把isFinish 变为false（已经做完的变为没做的）
				if(this.dataList[index].content.trim()!==this.beforeUpdate.content) this.dataList[index].isFinish = false;
				// 敲完回车，取消类名
				this.$refs.show[index].classList.remove('editing');
				// 将预备数组清空
				this.beforeUpdate = {};
			},
			// 还原内容
			backTodo(index) {
				// 按esc键，让选中的数组内容和预备数组内容相等
				this.dataList[index].content = this.beforeUpdate.content;
				this.$refs.show[index].classList.remove('editing');
				this.beforeUpdate = {};
			},
			// hashchange 事件
			hashchange() {
				// 依赖于data 中的属性
				// 通过hashchange事件改变data中的属性 1,2,3
				switch(window.location.hash) {
					case '':
					case '#/':
					this.showAll()
					this.activeBtn = 1
					break;
					case '#/active':
					this.activeAll(false)
					this.activeBtn = 2
					break;
					case '#/completed':
					this.activeAll(true)					
					this.activeBtn = 3
					break;
				}
			},

			// all：显示所有
			// active:显示未完成的
			// completed：显示已完成的
			// 创建一个显示数组
			showAll() {
				// 返回一个全部为true的数组 -- 全部显示
				this.showArr = this.dataList.map(() => true);
			},
			// 修改显示的数组使用
			activeAll(boo) {
				this.showArr = this.dataList.map(item => item.isFinish === boo);
				// 判断是不是有 true
				// 数组里面每一项应该都是 false
				if(this.dataList.every(item=> item.isFinish == !boo)) {
					return window.location.hash = '#/';
				}
			}
		},
		// 当数组发生改变就再次存储回 localStorage 里面,watch深度监听
		watch: {
			dataList:{
				// handler有两个参数newVal和oldVal
				handler(newArr) {
					// 将改变过得值添加到localStorage里
					window.localStorage.setItem('dataList',JSON.stringify(newArr));
					/*
						如果当前是 completed
						判断 dataList 里面有没有 isFinish 为 true 的
						如果没有切换到 #/
					*/
					this.hashchange();
				},
				deep:true
			}
		},
		// 计算属性
		computed: {
			// 计算所有 isFinish 为 false的值
			// 渲染还没有完成的数量和全部删除按钮的显示与隐藏
			activeNum() {
				return this.dataList.filter((item) => !item.isFinish).length;
			},
			// 全选
			toggleAll: {
				get() {
					// 数组中有一项不是true，便return false
					return this.dataList.every(item=>item.isFinish)
				},
				set(val) {
					// 已经触发了你想改变这个行为
					// 让 dataList 里面的每一项发生变化
					this.dataList.forEach(item=>item.isFinish = val);
				}
			}
		},
		// 自定义属性，自动获取光标
		directives: {
			focus:{
				inserted(el) {
					el.focus();
				}
			}
		},
		// 生命周期 -- 这个钩子函数就是创建了数据以后，还没有开始渲染页面之前
		created () {
			this.hashchange();
			window.onhashchange = () => {
				this.hashchange();
			}
		}
	})

})(window,Vue);

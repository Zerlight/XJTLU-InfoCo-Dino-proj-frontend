English Version:

---
## infinity_jump.js
Overrides the original function to adapt the ability to jump multiple times in the air while having stamina.
## life.js
Class that implements the life value system and its display.
## gauge.js
Class that implements the MP bar, stamina bar and buff duration display.
## casting.js
Class that implements the skill casting progress bar and remaining time.
## texteffect.js
Class that implements a text effect that is displayed briefly on the screen.
## score.js
Override the original function, add new function, and adapt the function of customizing score reward.
## chart.js
Add a new function for displaying a histogram of the frequency distribution of judgment timing at the end of a game.
---
## gp.js
Override `Runner.update` and `Runner.restart` functions, functions include:
1. initialize and reinitialize the above categories.
2. Record the timing of key presses, key releases, and collisions with obstacles.
3. realize the function of changing Game Over immediately after collision to wait for a certain period of time, and then decide whether to cancel blood deduction according to whether the defense counterattack is successful or whether the invincible state is successful or not, and then Game Over again after the blood level returns to zero. 4. realize the function of changing Game Over according to the above timing and its function.
4. Realize the function of determining the defense counterattack according to the above timing and its delay time, and realize the non-linear animation display of the process.
5. Realize the function of changing moves when MP is full, i.e. consume MP to make jumping back to blood, read the bar and add invincibility. 6.
6. Realize the function of sending message to `texteffect` class at the above timing to display the judgment level and other text effects.
7. Implement the compatibility of various UI colors with the automatic switching of night and day.
--- - - - - - - - - - - - - - - - - - - - -
## Notes
- `life`, `casting` and `gauge` will actively refresh the display.
- `texteffect` is special in that it needs to accept messages sent from outside to display text effects. It actually consists of two classes, `texteffect instance` and `texteffect controller`:
  - The `controller` maintains an array of `instance`s like a prioritized queue, which determines at each moment whether the elements in it should be displayed or destroyed when the timeout expires, and constructs the `instance` and puts it in the queue when it receives a message from the outside.
--- 

中文版本：

---
## infinity_jump.js
覆盖原版函数，适配在有体力的前提下在空中多段跳跃的功能。
## life.js
实现生命值系统及其显示功能的类。
## gauge.js
实现 MP 条、体力条和 buff 持续时间的显示功能的类。
## casting.js
实现显示技能发动进度条与剩余时间的类。
## texteffect.js
实现画面上短暂显示的文本效果的类。
## score.js
覆盖原版函数、新增函数，适配自定义分数奖励的功能。
## chart.js
新增函数，适配游戏结束后显示判定时机频数分布直方图的功能。
---
## gp.js
覆盖 `Runner.update` 和 `Runner.restart` 函数，功能包括：
1. 初始化、重新初始化上述各类。
2. 对按下按键、松开按键、与障碍物发生碰撞的时机进行记录。
3. 实现将碰撞后立即 Game Over 改为等待一定时间的判定后，根据是否防御反击成功或是否无敌状态决定是否取消扣血，血量归零后再 Game Over 的功能。
4. 实现根据上述时机及其延时进行防御反击的判定功能，并实现该过程的非线性动画显示。
5. 实现了在 MP 满的情况下的变招，即消耗 MP 使跳跃回血、读条附加无敌状态的功能。
6. 实现在上述各时机发送消息给 `texteffect` 类，显示判定等级和其他文本特效等的功能。
7. 实现各类 UI 颜色与白天黑夜自动切换的兼容性。
---
## 注意事项
- `life`、`casting` 和 `gauge` 都会主动刷新显示。
- `texteffect` 比较特殊，需要接受外部发送的消息才显示文本特效。它实际上由 `texteffect instance` 和 `texteffect controller` 两个类组成：
  - `controller` 维护了一个类似优先队列（不严谨）的 `instance` 数组，每个时刻判定其中的元素是显示还是超时销毁，并在收到外部消息时构造 `instance` 并放入队列中。
--- 
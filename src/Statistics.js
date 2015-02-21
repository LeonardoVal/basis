﻿/** # Statistics

Statistical accounting, measurements and related functions.
*/
var Statistics = exports.Statistics = declare({
	/** A `Statistics` is a bundle of Statistic objects.
	*/
	constructor: function Statistics() {
		this.__stats__ = {};
	},
	
	/** Each [`Statistic`](Statistic.js.html) object is stored in `__stats__`
	indexed by an identifier string generated by `__id__(keys)`.
	*/
	__id__: function __id__(keys) {
		if (typeof keys === 'object' && keys !== null) {
			if (Array.isArray(keys)) {
				return JSON.stringify(keys.slice().sort());
			} else {
				return Object.keys(keys).sort().map(function (n) {
					return JSON.stringify(n) +':'+ JSON.stringify(keys[n]);
				}).join(',');
			}
		} else {
			return JSON.stringify(keys)+'';
		}
	},
	
	/** `stats(keys)` gets the [`Statistic`](Statistic.js.html) objects that 
	applies to `keys`.
	*/
	stats: function stats(keys) {
		return iterable(this.__stats__).map(function (keyVal) {
			return keyVal[1];
		}, function (stat) {
			return stat.applies(keys);
		}).toArray();
	},
	
	/** `stat(keys)` gets the statistic that applies to `keys`, or creates it if
	it does not exist.
	*/
	stat: function stat(keys) {
		var id = this.__id__(keys);
		return this.__stats__[id] || (this.__stats__[id] = new Statistic(keys));
	},
	
	/** `addObject(obj, data)` adds the values in the given object, one stat per 
	member. If a member is an array, all numbers in the array are added.
	*/
	addObject: function addObject(obj, data) {
		raiseIf(!obj, "Cannot add object "+ JSON.stringify(obj) +".");
		for (var name in obj) {
			if (Array.isArray(obj[name])) {
				this.addAll(name, obj[name], data);
			} else {
				this.add(name, obj[name], data);
			}
		}
		return this; // For chaining.
	},
	
	/** `addStatistic(stat, keys=stat.keys)` adds the values in the given 
	[`Statistic`](Statistic.js.html) to the one with the same keys in this 
	object. If there is none one is created. This does not put the argument as 
	an statistic of this object.
	*/
	addStatistic: function addStatistic(stat, keys) {
		return this.stat(typeof keys !== 'undefined' ? keys : stat.keys).addStatistic(stat);
	},
	
	/** `addStatistics(stats, keys=all)` combines the stats of the given 
	`Statistics` with this one's.
	*/
	addStatistics: function addStatistics(stats, keys) {
		var self = this;
		stats.stats(keys).forEach(function (stat) {
			self.stat(stat.keys).addStatistic(stat);
		});
		return this;
	},
	
	// ## Statistic updating shortcuts #########################################
	
	/** `reset(keys)` resets all the stats that apply to the given `keys`.
	*/
	reset: function reset(keys) {
		this.stats(keys).forEach(function (stat) {
			stat.reset();
		});
		return this; // For chaining.
	},

	/** `add(keys, value, data)` adds a value to the corresponding statistics.
	*/
	add: function add(keys, value, data) {
		return this.stat(keys).add(value, data);
	},
	
	/** `gain(keys, value, factor, data)` gain a value to the corresponding 
	statistics.
	*/
	gain: function gain(keys, value, factor, data) {
		return this.stat(keys).gain(value, factor, data);
	},
	
	/** `addAll(keys, values, data)` add all values to the corresponding 
	statistics.
	*/
	addAll: function addAll(keys, values, data) {
		return this.stat(keys).addAll(values, data);
	},
	
	/** `gainAll(keys, values, factor, data)` gain all values to the 
	corresponding statistics.
	*/
	gainAll: function gainAll(keys, values, factor, data) {
		return this.stat(keys).addAll(values, data);
	},

	/** `startTime(keys, timestamp=now)` starts the timers of all the
	corresponding statistics.
	*/
	startTime: function startTime(keys, timestamp) {
		return this.stat(keys).startTime(timestamp);
	},
	
	/** `addTime(keys, data=undefined)` adds the times elapsed since the timers
	of the corresponding statistics was started.
	*/
	addTime: function addTime(keys, data) {
		return this.stat(keys).addTime(data);
	},
	
	/** `addTick(keys, data=undefined)` adds the times elapsed since the timers 
	of the corresponding statistics was started, and resets them.
	*/
	addTick: function addTick(keys, data) {
		return this.stat(keys).addTick(data);
	},
	
	// ## Statistic querying shortcuts #########################################
	
	/** `accumulation(keys)` creates a new statistic that accumulates all that 
	apply to the given keys.
	*/
	accumulation: function accumulation(keys) {
		var acc = new Statistic(keys);
		this.stats(keys).forEach(function (stat) {
			acc.addStatistic(stat);
		});
		return acc;
	},
	
	/** `count(keys)` gets the count of the accumulation of the corresponding 
	statistics.
	*/
	count: function count(keys) {
		return this.accumulation(keys).count();
	},
	
	/** `sum(keys)` gets the sum of the accumulation of the corresponding 
	statistics.
	*/
	sum: function sum(keys) {
		return this.accumulation(keys).sum();
	},
	
	/** `squareSum(keys)` gets the sum of squares of the accumulation of the 
	corresponding statistics.
	*/
	squareSum: function squareSum(keys) {
		return this.accumulation(keys).squareSum();
	},
	
	/** `minimum(keys)` gets the minimum value of the accumulation of the 
	corresponding statistics.
	*/
	minimum: function minimum(keys) {
		return this.accumulation(keys).minimum();
	},
	
	/** `maximum(keys)` gets the maximum value of the accumulation of the 
	corresponding statistics.
	*/
	maximum: function maximum(keys) {
		return this.accumulation(keys).maximum();
	},
	
	/** `average(keys)` gets the average value of the accumulation of the 
	corresponding statistics.
	*/
	average: function average(keys) {
		return this.accumulation(keys).average();
	},
	
	/** `variance(keys, center=average)` calculates the variance of the 
	accumulation of the corresponding statistics.
	*/
	variance: function variance(keys, center) {
		return this.accumulation(keys).variance(center);
	},
	
	/** `standardDeviation(keys, center=average)` calculates the standard 
	deviation of the accumulation of the corresponding statistics.
	*/
	standardDeviation: function standardDeviation(keys, center) {
		return this.accumulation(keys).standardDeviation(center);
	},
	
	// ## Other ################################################################
	
	/** The default string representation concatenates the string 
	representations off all `Statistic` objects, one per line.
	*/
	toString: function toString(fsep, rsep) {
		fsep = ''+ (fsep || '\t');
		rsep = ''+ (rsep || '\n');
		var stats = this.__stats__;
		return Object.keys(stats).map(function (name) {
			return stats[name].toString(fsep);
		}).join(rsep);
	}
}); // declare Statistics.

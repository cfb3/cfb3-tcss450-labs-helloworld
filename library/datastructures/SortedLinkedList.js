// sorted linkedlist class

class Node {

    constructor(element) {
        this.element = element
        this.next = null
        this.previous = null
    }
}

module.exports = class SortedLinkedList {

    constructor(theCapacity, theSort) {
        this.capacity = theCapacity
        this.size = 0
        this.head = null
        this.tail = null
        this.sort = theSort
    }

    
    add(element) {
        if(this.head == null) {
            let newNode = new Node(element)
            this.head = this.tail = newNode
            this.head.previous = null
            this.head.next = null
            this.size++
        } else if (this.canInsert(element)) {
            //Create a new NOde
            let newNode = new Node(element)
            if (this.sort(this.head.element, newNode.element) > 0) {
                //add Before the head
                newNode.next = this.head
                this.head.previous = newNode
                this.head = newNode
            } else if (this.sort(this.tail.element, newNode.element) <= 0) {
                //Add after the tail if there is room
                newNode.previous = this.tail
                this.tail.next = newNode
                this.tail = newNode
            } else {
                //Add somewhere in the middle
                let current = this.head
                while(current != null) {
                    if(this.sort(current.element, newNode.element) > 0) {
                        newNode.next = current
                        current.previous.next = newNode
                        newNode.previous = current.previous
                        current.previous = newNode
                        current = null
                    } else {
                        current = current.next
                    }
                }
            }
            this.size++
            if(this.size > this.capacity) {
                this.tail = this.tail.previous
                this.tail.next = null
                this.size = this.capacity
            }
        }
    }

    hasSpace() {
        return this.size < this.capacity
    }

    canInsert(element) {
        return this.hasSpace() || this.sort( this.tail.element, element) >= 0
    }

    toArray() {
        let current = this.head
        let returnMe = []

        while(current != null) {
            returnMe.push(current.element)
            current = current.next
        }

        return returnMe
    }
}